import React, { useState, useEffect } from "react";
import {
  List,
  Typography,
  Divider,
  Button,
  Popconfirm,
  message,
  Tooltip,
  Modal,
  Input,
} from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import Card from "antd/es/card";
import Sidebar from "./Sidebar";
import api from "../../api/axios";

import VehicleAssignmentType from "../../enums/VehicleAssignmentType";
import VehicleCategory from "../../enums/VehicleCategory";
import { set } from "date-fns";

const { Title, Text } = Typography;

const FixedVehicleAssignment = () => {
  const [assignments, setAssignments] = useState([]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newDeptId, setNewDeptId] = useState("");
  const [newVehicleIds, setNewVehicleIds] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [assignmentType, setAssignmentType] = useState("");
  // Search state for filtering vehicles
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [editVehicleSearch, setEditVehicleSearch] = useState("");
  // Edit modal state
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editAssignment, setEditAssignment] = useState(null);
  const [editDeptId, setEditDeptId] = useState("");
  const [editVehicleIds, setEditVehicleIds] = useState([]);
  const [editAssignmentType, setEditAssignmentType] = useState("");
  // Error state for edit modal
  const [editFormError, setEditFormError] = useState("");
  // Error state for add modal
  const [addFormError, setAddFormError] = useState("");

  // useEffect to fetch departments and vehicles on component mount
  useEffect(() => {
    fetchDepartments();
    fetchAvailableVehicles();
    fetchAssignments();

    // Optionally, fetch assignments from server if available
    // fetchAssignments();
  }, []);

  const handleDelete = async (id) => {
    console.log("department id to delete:", id);
    try {
      await api.delete(`/pre-approved-trips/${id}`);
      message.success("Assignment deleted successfully");
      fetchAssignments(); // Refresh the list after deletion
    } catch (error) {
      fetchAssignments();
      console.error("Error deleting assignment:", error);
      message.error("Failed to delete assignment");
    }
  };
  // fetch assignments from the server, pre-approved trips
  const fetchAssignments = async () => {
    try {
      const response = await api.get("/pre-approved-trips");
      setAssignments(response.data);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      message.error("Failed to fetch assignments");
    }
  };
  const handleEdit = (assignment) => {
    setEditAssignment(assignment);
    setEditDeptId(assignment.department.id.toString());
    setEditVehicleIds(assignment.vehicles.map(v => v.id.toString()));
    setEditAssignmentType(assignment.assignmentType);
    setEditModalVisible(true);
  };

  const handleEditOk = async () => {
    setEditFormError("");
    if (!editDeptId) {
      setEditFormError("Please select a department");
      return;
    }
    if (!editAssignmentType) {
      setEditFormError("Please select assignment type");
      return;
    }
    if (!editVehicleIds || editVehicleIds.length === 0) {
      setEditFormError("Please select at least one vehicle");
      return;
    }
    try {
      await api.put(`/pre-approved-trips/${editAssignment.id}`,
        {
          departmentId: editDeptId,
          vehicleIds: editVehicleIds,
          assignmentType: editAssignmentType,
        }
      );
      message.success("Assignment updated successfully");
      fetchAssignments();
      setEditModalVisible(false);
    } catch (error) {
      setEditFormError("Failed to update assignment");
      console.error("Error updating assignment:", error);
    }
    setEditAssignment(null);
    setEditDeptId("");
    setEditVehicleIds([]);
    setEditAssignmentType("");
  };

  const handleAdd = () => {
    setAddModalVisible(true);
  };
  // fetch departments and vehicles from the server
  const fetchDepartments = async () => {
    try {
      const response = await api.get("/departments");
      setDepartments(response.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
      message.error("Failed to fetch departments");
    }
  };

  const fetchAvailableVehicles = async () => {
    try {
      const response = await api.get(`/vehicles/category/${VehicleCategory.GENERAL}`);
      setVehicles(response.data);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      message.error("Failed to fetch vehicles");
    }
  };

  const handleAddOk = async () => {
    setAddFormError("");
    if (!newDeptId) {
      setAddFormError("Please select a department");
      return;
    }
    if (!assignmentType) {
      setAddFormError("Please select assignment type");
      return;
    }
    if (!newVehicleIds || newVehicleIds.length === 0) {
      setAddFormError("Please select at least one vehicle");
      return;
    }
    try {
      await api.post("/pre-approved-trips", {
        departmentId: newDeptId,
        vehicleIds: newVehicleIds,
        assignmentType: assignmentType,
      });
      message.success("Assignment added successfully");
      fetchAssignments();
      setAddModalVisible(false);
    } catch (error) {
      setAddFormError("Failed to add assignment");
      console.error("Error adding assignment:", error);
    }
    setNewDeptId("");
    setNewVehicleIds([]);
    setAssignmentType("");
  };

  // Filter vehicles by search (add modal)
  const filteredVehicles = vehicles.filter((vehicle) =>
    vehicle.plateNumber.toLowerCase().includes(vehicleSearch.toLowerCase())
  );
  // Filter vehicles by search (edit modal)
  const filteredEditVehicles = vehicles.filter((vehicle) =>
    vehicle.plateNumber.toLowerCase().includes(editVehicleSearch.toLowerCase())
  );

  return (
    <div className="manager-dashboard-layout">
      <Sidebar />
      <div style={{ maxWidth: 700, margin: "40px auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <Title level={2} style={{ margin: 0 }}>Fixed Vehicle Assignments</Title>
          <Tooltip title="Add Assignment">
            <Button
              type="primary"
              shape="circle"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              aria-label="Add assignment"
            />
          </Tooltip>
        </div>
        {/* ...existing code... */}
        <List
          grid={{ gutter: 24, column: 1 }}
          dataSource={assignments}
          renderItem={(assignment) => (
            <List.Item>
              <Card
                title={
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>
                      <Text strong style={{ fontSize: 18 }}>
                        {assignment.department.name}
                      </Text>
                    </span>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Tooltip title="Edit">
                        <Button
                          type="text"
                          shape="circle"
                          icon={
                            <EditOutlined
                              style={{ color: "#1890ff", fontSize: 18 }}
                            />
                          }
                          style={{
                            background: "rgba(24,144,255,0.08)",
                          }}
                          aria-label="Edit assignment"
                          onClick={() => handleEdit(assignment)}
                        />
                      </Tooltip>
                      <Popconfirm
                        title="Delete this assignment?"
                        onConfirm={() => handleDelete(assignment.id)}
                        okText="Yes"
                        cancelText="No"
                      >
                        <Tooltip title="Delete">
                          <Button
                            type="text"
                            shape="circle"
                            icon={
                              <DeleteOutlined
                                style={{ color: "#ff4d4f", fontSize: 18 }}
                              />
                            }
                            style={{
                              background: "rgba(255,77,79,0.08)",
                            }}
                            aria-label="Delete assignment"
                          />
                        </Tooltip>
                      </Popconfirm>
                    </div>
                  </div>
                }
                bordered
                style={{
                  borderRadius: 12,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                  background:
                    "linear-gradient(90deg, #f0f5ff 0%, #e6fffb 100%)",
                }}
              >
                {/* show assignment type(Full day, Night shift) */}
                <Text type="secondary">
                  {assignment.assignmentType === VehicleAssignmentType.FULL_TIME
                    ? "Full Day"
                    : "Night Only (starting 5:00 PM)"}
                </Text>
                <Divider orientation="left" plain>
                  <Text type="secondary">Assigned Vehicles</Text>
                </Divider>
                <List
                  dataSource={assignment.vehicles}
                  renderItem={(vehicle) => (
                    <List.Item style={{ border: "none", paddingLeft: 0 }}>
                      <span role="img" aria-label="vehicle">
                        🚙
                      </span>{" "}
                      <Text>
                        {vehicle.plateNumber}-{vehicle.model}
                      </Text>
                    </List.Item>
                  )}
                  size="small"
                />
              </Card>
            </List.Item>
          )}
        />
        <Modal
          title="Add Assignment"
          open={addModalVisible}
          onOk={handleAddOk}
          onCancel={() => {
            setAddModalVisible(false);
            setNewDeptId("");
            setNewVehicleIds([]);
            setAssignmentType("");
            setAddFormError("");
            setVehicleSearch("");
          }}
          okText="Add"
        >
          {addFormError && (
            <div style={{ color: '#ff4d4f', marginBottom: 12, fontWeight: 500 }}>
              {addFormError}
            </div>
          )}
          <div style={{ marginBottom: 16 }}>
            <label
              style={{ fontWeight: 500, marginBottom: 6, display: "block" }}
            >
              Department
            </label>
            <select
              value={newDeptId}
              onChange={(e) => setNewDeptId(e.target.value)}
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 6,
                border: "1px solid #ccc",
              }}
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label
              style={{ fontWeight: 500, marginBottom: 6, display: "block" }}
            >
              Type
            </label>
            <select
              value={assignmentType}
              onChange={(e) => setAssignmentType(e.target.value)}
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 6,
                border: "1px solid #ccc",
              }}
            >
              <option value="">Select Type</option>
              <option value={VehicleAssignmentType.FULL_TIME}>Full Day</option>
              <option value={VehicleAssignmentType.NIGHT_SHIFT}>Night Only (starting 5:00 PM)</option>
            </select>
          </div>
          <div>
            <label
              style={{ fontWeight: 500, marginBottom: 6, display: "block" }}
            >
              Vehicles
            </label>
            <Input
              placeholder="Search by plate number"
              value={vehicleSearch}
              onChange={e => setVehicleSearch(e.target.value)}
              style={{ marginBottom: 8, borderRadius: 6 }}
              allowClear
            />
            <div
              style={{
                maxHeight: 180,
                overflowY: "auto",
                border: "1px solid #eee",
                borderRadius: 6,
                padding: 8,
              }}
            >
              {vehicles.length === 0 ? (
                <span style={{ color: "#ff4d4f" }}>No available vehicles.</span>
              ) : filteredVehicles.length === 0 ? (
                <span style={{ color: "#faad14" }}>No vehicles match your search.</span>
              ) : (
                filteredVehicles.map((vehicle) => (
                  <label
                    key={vehicle.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 4,
                    }}
                  >
                    <input
                      type="checkbox"
                      value={vehicle.id}
                      checked={newVehicleIds.includes(vehicle.id.toString())}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewVehicleIds((prev) => [
                            ...prev,
                            vehicle.id.toString(),
                          ]);
                        } else {
                          setNewVehicleIds((prev) =>
                            prev.filter((id) => id !== vehicle.id.toString())
                          );
                        }
                      }}
                    />
                    <span>
                      {vehicle.plateNumber} ({vehicle.model})
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>
        </Modal>

        {/* Edit Modal */}
        <Modal
          title="Edit Assignment"
          open={editModalVisible}
          onOk={handleEditOk}
          onCancel={() => {
            setEditModalVisible(false);
            setEditAssignment(null);
            setEditDeptId("");
            setEditVehicleIds([]);
            setEditAssignmentType("");
            setEditFormError("");
            setEditVehicleSearch("");
          }}
          okText="Update"
        >
          {editFormError && (
            <div style={{ color: '#ff4d4f', marginBottom: 12, fontWeight: 500 }}>
              {editFormError}
            </div>
          )}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: 500, marginBottom: 6, display: "block" }}>
              Department
            </label>
            <select
              value={editDeptId}
              onChange={(e) => setEditDeptId(e.target.value)}
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 6,
                border: "1px solid #ccc",
              }}
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: 500, marginBottom: 6, display: "block" }}>
              Type
            </label>
            <select
              value={editAssignmentType}
              onChange={(e) => setEditAssignmentType(e.target.value)}
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 6,
                border: "1px solid #ccc",
              }}
            >
              <option value="">Select Type</option>
              <option value={VehicleAssignmentType.FULL_TIME}>Full Day</option>
              <option value={VehicleAssignmentType.NIGHT_SHIFT}>Night Only (starting 5:00 PM)</option>
            </select>
          </div>
          <div>
            <label style={{ fontWeight: 500, marginBottom: 6, display: "block" }}>
              Vehicles
            </label>
            <Input
              placeholder="Search by plate number"
              value={editVehicleSearch}
              onChange={e => setEditVehicleSearch(e.target.value)}
              style={{ marginBottom: 8, borderRadius: 6 }}
              allowClear
            />
            <div
              style={{
                maxHeight: 180,
                overflowY: "auto",
                border: "1px solid #eee",
                borderRadius: 6,
                padding: 8,
              }}
            >
              {vehicles.length === 0 && editAssignment && editAssignment.vehicles.length > 0 ? (
                <>
                  <span style={{ color: "#faad14" }}>No available vehicles. Only currently assigned vehicles are shown below.</span>
                  {editAssignment.vehicles.map((vehicle) => (
                    <label
                      key={vehicle.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 4,
                      }}
                    >
                      <input
                        type="checkbox"
                        value={vehicle.id}
                        checked={editVehicleIds.includes(vehicle.id.toString())}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditVehicleIds((prev) => [
                              ...prev,
                              vehicle.id.toString(),
                            ]);
                          } else {
                            setEditVehicleIds((prev) =>
                              prev.filter((id) => id !== vehicle.id.toString())
                            );
                          }
                        }}
                      />
                      <span>
                        {vehicle.plateNumber} ({vehicle.model})
                      </span>
                    </label>
                  ))}
                </>
              ) : filteredEditVehicles.length === 0 ? (
                <span style={{ color: "#faad14" }}>No vehicles match your search.</span>
              ) : (
                filteredEditVehicles.map((vehicle) => (
                  <label
                    key={vehicle.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 4,
                    }}
                  >
                    <input
                      type="checkbox"
                      value={vehicle.id}
                      checked={editVehicleIds.includes(vehicle.id.toString())}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEditVehicleIds((prev) => [
                            ...prev,
                            vehicle.id.toString(),
                          ]);
                        } else {
                          setEditVehicleIds((prev) =>
                            prev.filter((id) => id !== vehicle.id.toString())
                          );
                        }
                      }}
                    />
                    <span>
                      {vehicle.plateNumber} ({vehicle.model})
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default FixedVehicleAssignment;
