import React, { useState, useEffect } from 'react';
// import DOMPurify from 'dompurify'; // Uncomment if you need to sanitize HTML
import Sidebar from './Sidebar';
import './Reports.css';
import VehicleReport from './reports/VehicleReport';
import RequestReport from './reports/RequestReport';
import DriverReport from './reports/DriverReport';
import FinancialReport from './reports/FinancialReport';
import OperationalReport from './reports/OperationalReport';
import { vehicleReportData, requestReportData, driverReportData, financialReportData, operationalReportData } from './reports/data';
import { exportToPDF,exportToExcel, exportToCSV } from '../../utils/exportUtils';
import './Reports.css';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

import api from "../../api/axios"


const Reports = () => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1), // January 1st
    endDate: new Date(new Date().getFullYear(), 11, 31)  // December 31st
  });
  const [reportType, setReportType] = useState('Vehicle');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (reportData) {
      setShowExportOptions(true);
    }
  }, [reportData]);

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleExport = async (format) => {
    if (!reportData) return;

    try {
      setExporting(true);
      setError(null);
      const today = new Date();

      // Format dates for export
      const formatDate = (date) => {
        // Ensure we have a valid Date object
        const dateObj = date instanceof Date ? date : new Date(date);
        if (isNaN(dateObj.getTime())) {
          console.error('Invalid date:', date);
          return 'Invalid Date';
        }
        return dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      };

      let exportData;
      switch (reportType) {
        case 'Vehicle':
          // Calculate vehicle metrics from maintenance schedule
          const vehicleMetrics = reportData.maintenanceSchedule.reduce((acc, record) => {
            if (!acc[record.vehicleId]) {
              acc[record.vehicleId] = {
                id: record.vehicleId,
                type: record.type,
                maintenanceCount: 0,
                totalDistance: record.totalDistance || 0,
                assignments: record.assignments || 0,
                lastMaintenance: null,
                lastAssignment: record.lastAssignment,
                status: record.status
              };
            }
            
            acc[record.vehicleId].maintenanceCount++;
            acc[record.vehicleId].lastMaintenance = record.date;
            
            return acc;
          }, {});

          exportData = {
            reportType: 'Vehicle Report',
            generatedAt: new Date().toISOString(),
            dateRange: {
              start: formatDate(dateRange.startDate),
              end: formatDate(dateRange.endDate)
            },
            summary: {
              totalVehicles: reportData.vehicleTypes.reduce((sum, type) => sum + type.count, 0),
              vehicleTypes: reportData.vehicleTypes
            },
            operationalMetrics: {
              mostFrequentlyUsed: Object.values(vehicleMetrics)
                .sort((a, b) => b.assignments - a.assignments)
                .slice(0, 5),
              mostMaintained: Object.values(vehicleMetrics)
                .sort((a, b) => b.maintenanceCount - a.maintenanceCount)
                .slice(0, 5),
              idleVehicles: Object.values(vehicleMetrics)
                .filter(vehicle => {
                  const lastAssignment = new Date(vehicle.lastAssignment || 0);
                  const daysSinceLastAssignment = Math.floor((today - lastAssignment) / (1000 * 60 * 60 * 24));
                  return daysSinceLastAssignment > 30;
                })
            },
            maintenanceSchedule: reportData.maintenanceSchedule
          };
          break;

        case 'Driver':
          // Calculate driver metrics from driver details
          const driverMetrics = reportData.driverDetails.reduce((acc, driver) => {
            if (!acc[driver.id]) {
              acc[driver.id] = {
                id: driver.id,
                name: driver.name,
                status: driver.status,
                performance: driver.performance,
                totalRequests: driver.totalRequests || 0,
                completedRequests: driver.completedRequests || 0,
                totalDistance: driver.totalDistance || 0,
                averageRating: driver.averageRating || 0,
                lastActive: driver.date
              };
            }
            return acc;
          }, {});

          exportData = {
            reportType: 'Driver Report',
            generatedAt: new Date().toISOString(),
            dateRange: {
              start: formatDate(dateRange.startDate),
              end: formatDate(dateRange.endDate)
            },
            summary: {
              totalDrivers: reportData.driverStatus.reduce((sum, status) => sum + status.count, 0),
              driverStatus: reportData.driverStatus
            },
            operationalMetrics: {
              mostActiveDrivers: Object.values(driverMetrics)
                .sort((a, b) => b.totalRequests - a.totalRequests)
                .slice(0, 5),
              topPerformingDrivers: Object.values(driverMetrics)
                .filter(driver => driver.performance === 'Excellent')
                .sort((a, b) => b.completedRequests - a.completedRequests)
                .slice(0, 5),
              inactiveDrivers: Object.values(driverMetrics)
                .filter(driver => {
                  const lastActive = new Date(driver.lastActive);
                  const daysSinceLastActive = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));
                  return daysSinceLastActive > 30;
                })
            },
            driverDetails: reportData.driverDetails
          };
          break;

        case 'Request':
          // Calculate status distribution
          const statusCounts = reportData.requestDetails.reduce((acc, request) => {
            acc[request.status] = (acc[request.status] || 0) + 1;
            return acc;
          }, {});

          const totalRequests = reportData.requestDetails.length;
          const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
            status,
            count,
            percentage: ((count / totalRequests) * 100).toFixed(1)
          }));

          // Find approved requests without vehicle assignment for more than 7 days
          const approvedUnassignedRequests = reportData.requestDetails.filter(request => {
            if (request.status === 1 ) {
              const requestDate = new Date(request.date);
              const daysDiff = Math.floor((today - requestDate) / (1000 * 60 * 60 * 24));
              return daysDiff > 7;
            }
            return false;
          });

          exportData = {
            reportType: 'Request Report',
            generatedAt: new Date().toISOString(),
            dateRange: {
              start: formatDate(dateRange.startDate),
              end: formatDate(dateRange.endDate)
            },
            summary: {
              totalRequests: reportData.requestTypes.reduce((sum, type) => sum + type.count, 0),
              requestTypes: reportData.requestTypes
            },
            operationalMetrics: {
              statusDistribution,
              approvedUnassignedRequests: approvedUnassignedRequests.map(request => ({
                id: request.id,
                type: request.type,
                date: request.date,
                daysSinceApproval: Math.floor((today - new Date(request.date)) / (1000 * 60 * 60 * 24))
              }))
            },
            requestDetails: reportData.requestDetails
          };
          break;

        case 'Financial':
          exportData = {
            reportType: 'Financial Report',
            generatedAt: new Date().toISOString(),
            dateRange: {
              start: formatDate(dateRange.startDate),
              end: formatDate(dateRange.endDate)
            },
            summary: {
              totalRevenue: reportData.revenueBreakdown.reduce((sum, item) => sum + item.amount, 0),
              totalExpenses: reportData.expenseBreakdown.reduce((sum, item) => sum + item.amount, 0),
              netProfit: reportData.revenueBreakdown.reduce((sum, item) => sum + item.amount, 0) -
                        reportData.expenseBreakdown.reduce((sum, item) => sum + item.amount, 0)
            },
            revenueBreakdown: reportData.revenueBreakdown,
            expenseBreakdown: reportData.expenseBreakdown,
            outstandingPayments: reportData.outstandingPayments
          };
          break;
      }

      let content;
      let filename;
      let mimeType;

      // Map reportType to a safe filename key to avoid relying on user-controllable strings
      const reportTypeToKey = {
        Vehicle: 'vehicle',
        Driver: 'driver',
        Request: 'request',
        Financial: 'financial'
      };
      const reportKey = reportTypeToKey[reportType] || 'report';

      switch (format) {
        case 'excel':
          content = await exportToExcel(exportData,reportType,{
            startDate: formatDate(dateRange.startDate),
            endDate: formatDate(dateRange.endDate)
          });
          filename = `${reportKey}_report_${new Date().toISOString().split('T')[0]}.xlsx`;
          mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          break;
        case 'pdf':
          content = await exportToPDF(exportData, reportType, {
            startDate: formatDate(dateRange.startDate),
            endDate: formatDate(dateRange.endDate)
          });
          filename = `${reportKey}_report_${new Date().toISOString().split('T')[0]}.pdf`;
          mimeType = 'application/pdf';
          break;
        case 'csv':
          content = exportToCSV(exportData,reportType,{
            startDate: formatDate(dateRange.startDate),
            endDate: formatDate(dateRange.endDate)
          });
          filename = `${reportKey}_report_${new Date().toISOString().split('T')[0]}.csv`;
          mimeType = 'text/csv';
          break;
        default:
          throw new Error('Unsupported export format');
      }

      // Create and trigger download
      // Sanitize filename to prevent DOM injection via crafted filenames
      const sanitizeFilename = (name) => {
        if (!name) return 'download';
        // Remove any path traversal, control characters, and scriptable chars
        return name.replace(/\.(?=[^.]*$)/, '___').replace(/[\\/\r\n%<>"'`|;]/g, '').replace(/\s+/g, '_');
      };

      const safeFilename = sanitizeFilename(filename);

      const blob = new Blob([content], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = safeFilename;
      // We still append the element to the DOM to support older browsers
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setShowExportOptions(false);
    } catch (error) {
      console.error('Error exporting report:', error);
      setError('Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  const generateReport = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // fetch real data
      switch(reportType){
        case 'Request':
          const requests= await api.get("/requests");
          const pendingRequests=[];
          const approvedUnassignedRequests=[];
          const rejectedRequests=[]
          const requestsInJourneyProgress=[];
          const assignedUnApprovedRequests=[];
          const assignedApprovedRequests=[];
          const completedRequests=[]

          requests.data.map(r=>{
            if(r.status===0)
              pendingRequests.push(r);
            else if(r.status===1)
              approvedUnassignedRequests.push(r);
            else if(r.status===2)
              rejectedRequests.push(r);
            else if(r.status===3)
              assignedUnApprovedRequests.push(r);
            else if(r.status===4)
              assignedApprovedRequests.push(r);
            else if(r.status===5)
              requestsInJourneyProgress.push(r);
            else if(r.status===6)
              completedRequests.push(r)
            return r;
          })
          // count requests in trip type
          const fieldTripCount=requests.data.reduce((acc,request)=>{
            return acc=request.tripType==="FIELD_TRIP"?acc+1:acc;  
          },0)
          const cityTripCount=requests.data.reduce((acc,request)=>{
            return acc=request.tripType==="CITY_TRIP"? acc+1 : acc;  
          },0)
          const emergencyTripCount=requests.data.reduce((acc,request)=>{
            return acc=request.tripType==="EMERGENCY_TRIP"? acc+1 : acc;  
          },0)
          const shutleTripCount=requests.data.reduce((acc,request)=>{
            return acc=request.tripType==="SHUTLE_TRIP"? acc+1 : acc;  
          },0)
          const nightShiftTripCount=requests.data.reduce((acc,request)=>{
            return acc=request.tripType==="NIGHT_SHIFT_TRIP"? acc+1 : acc;  
          },0)    
          setReportData({
            requestTypes: [
              { type: 'Field Trip', count: fieldTripCount },
              { type: 'City Trip', count: cityTripCount },
              { type: 'Emergency Trip', count: emergencyTripCount },
              { type: 'Shutle Trip', count: shutleTripCount },
              { type: 'Night shift Trip', count: nightShiftTripCount }
            ],
            requestDetails: requests.data, 
            maintenanceSchedule: [
              {
                vehicleId: 'V001',
                type: 'Sedan',
                date: '2024-01-15',
                status: 'Scheduled',
                assignments: 12,
                totalDistance: 2500,
                lastAssignment: '2024-03-01'
              },
              {
                vehicleId: 'V002',
                type: 'SUV',
                date: '2024-02-20',
                status: 'Completed',
                assignments: 8,
                totalDistance: 1800,
                lastAssignment: '2024-03-15'
              }
            ]
          });

          break;
        case 'Vehicle':
          const type_destribution = await api.get("/reports/vehicles/type-distribution");
          const status_report = await api.get("/reports/vehicles/status-report");

          const formatDateTime = (date) => new Date(date).toISOString(); // returns ISO 8601 string

          const vehicle_summery = await api.get(`/reports/vehicles/summary?start=${formatDateTime(dateRange.startDate)}&end=${formatDateTime(dateRange.endDate)}`);

          setReportData({
            type_destribution:type_destribution.data,
            status_report:status_report.data,
            vehicle_summery:vehicle_summery.data
          })
          break;
        case 'Driver': {
          const driverStatus = await api.get("/reports/drivers/status-distribution");
          const mostActive = await api.get("/reports/drivers/most-active");
          const topPerformers = await api.get("/reports/drivers/top-performance");
          const inactive = await api.get("/reports/drivers/inactive?days=30"); 
          const allDrivers = await api.get("/logistics/drivers"); 

          setReportData({
            driverStatus: driverStatus.data,
            mostActiveDrivers: mostActive.data,
            topPerformingDrivers: topPerformers.data,
            inactiveDrivers: inactive.data,
            driverDetails: allDrivers.data,
          });

          break;
        }

          
      }
      // Simulate API response with 2024 data
      const response = await new Promise(resolve => {
        setTimeout(() => {
          switch (reportType) {
            case 'Vehiclee':
              resolve({
                vehicleTypes: [
                  { type: 'Sedan', count: 5 },
                  { type: 'SUV', count: 3 },
                  { type: 'Truck', count: 2 }
                ],
                maintenanceSchedule: [
                  { 
                    vehicleId: 'V001', 
                    type: 'Sedan', 
                    date: '2024-01-15', 
                    status: 'Scheduled',
                    assignments: 12,
                    totalDistance: 2500,
                    lastAssignment: '2024-03-01'
                  },
                  { 
                    vehicleId: 'V002', 
                    type: 'SUV', 
                    date: '2024-02-20', 
                    status: 'Completed',
                    assignments: 8,
                    totalDistance: 1800,
                    lastAssignment: '2024-03-15'
                  },
                  { 
                    vehicleId: 'V003', 
                    type: 'Truck', 
                    date: '2024-03-10', 
                    status: 'Pending',
                    assignments: 15,
                    totalDistance: 3200,
                    lastAssignment: '2024-03-20'
                  },
                  { 
                    vehicleId: 'V004', 
                    type: 'Sedan', 
                    date: '2024-04-05', 
                    status: 'Scheduled',
                    assignments: 5,
                    totalDistance: 1200,
                    lastAssignment: '2024-02-15'
                  },
                  { 
                    vehicleId: 'V005', 
                    type: 'SUV', 
                    date: '2024-05-15', 
                    status: 'Completed',
                    assignments: 10,
                    totalDistance: 2100,
                    lastAssignment: '2024-03-10'
                  }
                ]
              });
              break;
            case 'Driver':
              resolve({
                driverStatus: [
                  { status: 'Active', count: 8 },
                  { status: 'On Leave', count: 2 }
                ],
                driverDetails: [
                  { 
                    id: 'D001', 
                    name: 'John Doe', 
                    status: 'Active', 
                    performance: 'Excellent', 
                    date: '2024-01-10',
                    totalRequests: 25,
                    completedRequests: 22,
                    totalDistance: 3500,
                    averageRating: 4.8
                  },
                  { 
                    id: 'D002', 
                    name: 'Jane Smith', 
                    status: 'On Leave', 
                    performance: 'Excellent', 
                    date: '2024-02-15',
                    totalRequests: 18,
                    completedRequests: 18,
                    totalDistance: 2800,
                    averageRating: 4.9
                  },
                  { 
                    id: 'D003', 
                    name: 'Mike Johnson', 
                    status: 'Active', 
                    performance: 'Good', 
                    date: '2024-03-20',
                    totalRequests: 15,
                    completedRequests: 12,
                    totalDistance: 2200,
                    averageRating: 4.2
                  },
                  { 
                    id: 'D004', 
                    name: 'Sarah Wilson', 
                    status: 'Active', 
                    performance: 'Excellent', 
                    date: '2024-04-25',
                    totalRequests: 20,
                    completedRequests: 19,
                    totalDistance: 3100,
                    averageRating: 4.7
                  }
                ]
              });
              break;
            case 'Requestt':
              resolve({
                requestTypes: [
                  { type: 'Maintenance', count: 4 },
                  { type: 'Transport', count: 6 }
                ],
                requestDetails: [
                  { id: 'R001', type: 'Maintenance', status: 'Pending', date: '2024-01-05' },
                  { id: 'R002', type: 'Transport', status: 'Approved', date: '2024-02-10' },
                  { id: 'R003', type: 'Maintenance', status: 'Completed', date: '2024-03-15' },
                  { id: 'R004', type: 'Transport', status: 'Pending', date: '2024-04-20' },
                  { id: 'R005', type: 'Maintenance', status: 'Approved', date: '2024-05-25' }
                ]
              });
              break;
            case 'Financial':
              resolve({
                revenueBreakdown: [
                  { category: 'Transport', amount: 5000, date: '2024-01-31' },
                  { category: 'Maintenance', amount: 2000, date: '2024-02-29' },
                  { category: 'Other', amount: 1000, date: '2024-03-31' }
                ],
                expenseBreakdown: [
                  { category: 'Fuel', amount: 1500, date: '2024-01-31' },
                  { category: 'Repairs', amount: 1000, date: '2024-02-29' },
                  { category: 'Insurance', amount: 800, date: '2024-03-31' }
                ],
                outstandingPayments: [
                  { id: 'P001', amount: 500, dueDate: '2024-04-15', status: 'Pending' },
                  { id: 'P002', amount: 300, dueDate: '2024-05-20', status: 'Overdue' },
                  { id: 'P003', amount: 750, dueDate: '2024-06-25', status: 'Pending' }
                ]
              });
              break;
            default:
              resolve(null);
          }
        }, 1000);
      });

      // if (!response) {
      //   setError('No data available for the selected report type');
      //   setReportData(null);
      //   return;
      // }

      // // Set the data directly without filtering
      // setReportData(response);
      // setError(null);
      // setShowExportOptions(true);
    } catch (error) {
      setError('Failed to generate report');
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const renderReport = () => {
    if (!reportData) return null;

    // If you ever need to render HTML from user input, use DOMPurify:
    // <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />

    switch (reportType) {
      case 'Vehicle':
        // VehicleReport should not use dangerouslySetInnerHTML with unsanitized data
        return <VehicleReport data={reportData} />;
      case 'Driver':
        return <DriverReport data={reportData} />;
      case 'Request':
        return <RequestReport data={reportData} />;
      case 'Financial':
        return <FinancialReport data={reportData} />;
      default:
        return null;
    }
  };

  // State to toggle export options dropdown
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  // Hide export dropdown when exporting starts or report changes
  useEffect(() => {
    setShowExportDropdown(false);
  }, [reportData, exporting]);

  // Toggle handler for Export button
  const handleExportToggle = () => {
    setShowExportDropdown((prev) => !prev);
  };

  return (
    <div className="manager-dashboard-layout">
      <Sidebar />
      <main className="manager-dashboard-main">
        <div className="dashboard-header">
          <h1 className="dashboard-title">REPORTS</h1>
        </div>
        
        <div className="reports-container">
          <div className="reports-header">
            {/* <h2>Reports</h2> */}
            <div className="reports-controls">
              <div className="form-group">
                <label>Report Type</label>
                <select 
                  value={reportType} 
                  onChange={(e) => setReportType(e.target.value)}
                  className="form-control"
                >
                  <option value="Vehicle">Vehicle Report</option>
                  <option value="Driver">Driver Report</option>
                  <option value="Request">Request Report</option>
                  <option value="Financial">Financial Report</option>
                </select>
              </div>
              
              <div className="date-range-container">
                <div className="date-inputs">
                  <div className="form-group">
                    <label>Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      value={dateRange.startDate}
                      onChange={handleDateChange}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      value={dateRange.endDate}
                      onChange={handleDateChange}
                      className="form-control"
                    />
                  </div>
                </div>
              </div>

              <div className="button-group">
                <button 
                  className="generate-button"
                  onClick={generateReport}
                  disabled={loading}
                >
                  {loading ? 'Generating...' : 'Generate Report'}
                </button>

                {/* {showExportOptions && (
                  <div className="export-dropdown">
                    <button
                      className="export-button"
                      onClick={handleExportToggle}
                      onDoubleClick={handleExportToggle}
                    >
                      Export
                    </button>
                    {showExportDropdown || (
                      <div className="export-options">
                        <button onClick={() => handleExport('pdf')}>PDF</button>
                        <button onClick={() => handleExport('excel')}>Excel</button>
                        <button onClick={() => handleExport('csv')}>CSV</button>
                      </div>
                    )} 
                  </div>
                 )}  */}
              </div>
            </div>
          </div>

          {/* error is rendered as plain text, safe from XSS */}
          {error && <div className="error-message">{error}</div>}
          
          <div className="report-content">
            {renderReport()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Reports; 