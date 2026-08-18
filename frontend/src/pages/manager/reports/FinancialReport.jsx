import React from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const FinancialReport = ({ data }) => {
  if (!data || !data.revenueBreakdown || !data.expenseBreakdown || !data.outstandingPayments) {
    return <div className="no-data-message">No data available for the selected date range</div>;
  }

  return (
    <div className="report-content">
      <div className="report-section">
        <h3>Revenue Breakdown</h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.revenueBreakdown}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="amount" fill="#8884d8" name="Amount" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="report-section">
        <h3>Expense Breakdown</h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.expenseBreakdown}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="amount" fill="#82ca9d" name="Amount" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="report-section">
        <h3>Outstanding Payments</h3>
        <div className="table-container">
          <table className="report-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.outstandingPayments.map((item, index) => (
                <tr key={index}>
                  <td>{item.id}</td>
                  <td>{item.amount}</td>
                  <td>{item.dueDate}</td>
                  <td>{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinancialReport; 