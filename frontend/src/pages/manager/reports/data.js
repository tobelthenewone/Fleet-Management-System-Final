// Vehicle Report Data
export const vehicleReportData = {
  totalVehicles: 50,
  availableVehicles: 35,
  inUseVehicles: 12,
  maintenanceVehicles: 3,
  vehicleTypes: [
    { type: 'Sedan', count: 20 },
    { type: 'SUV', count: 15 },
    { type: 'Van', count: 10 },
    { type: 'Truck', count: 5 }
  ],
  availabilityTrend: [
    { date: '2024-01', available: 30, inUse: 15, maintenance: 5 },
    { date: '2024-02', available: 32, inUse: 13, maintenance: 5 },
    { date: '2024-03', available: 35, inUse: 12, maintenance: 3 }
  ],
  maintenanceStatus: [
    { status: 'Scheduled', count: 8 },
    { status: 'In Progress', count: 3 },
    { status: 'Completed', count: 15 }
  ],
  vehicleDetails: [
    {
      id: 'VH001',
      type: 'Sedan',
      status: 'Available',
      lastMaintenance: '2024-02-15',
      nextMaintenance: '2024-05-15'
    },
    {
      id: 'VH002',
      type: 'SUV',
      status: 'In Use',
      lastMaintenance: '2024-01-20',
      nextMaintenance: '2024-04-20'
    }
  ]
};

// Request Report Data
export const requestReportData = {
  totalRequests: 100,
  pendingRequests: 20,
  approvedRequests: 70,
  rejectedRequests: 10,
  requestTypes: [
    { type: 'Transport', count: 60 },
    { type: 'Maintenance', count: 30 },
    { type: 'Other', count: 10 }
  ],
  requestTrend: [
    { date: '2024-01', total: 30, approved: 20, rejected: 5, pending: 5 },
    { date: '2024-02', total: 35, approved: 25, rejected: 5, pending: 5 },
    { date: '2024-03', total: 35, approved: 25, rejected: 5, pending: 5 }
  ],
  requestDetails: [
    {
      id: 'REQ001',
      type: 'Transport',
      status: 'Approved',
      requester: 'John Doe',
      date: '2024-03-01'
    },
    {
      id: 'REQ002',
      type: 'Maintenance',
      status: 'Pending',
      requester: 'Jane Smith',
      date: '2024-03-02'
    }
  ]
};

// Driver Report Data
export const driverReportData = {
  totalDrivers: 25,
  activeDrivers: 20,
  onLeaveDrivers: 5,
  driverPerformance: [
    { driver: 'John Doe', trips: 45, rating: 4.5, hours: 180 },
    { driver: 'Jane Smith', trips: 38, rating: 4.8, hours: 160 },
    { driver: 'Mike Johnson', trips: 42, rating: 4.2, hours: 175 }
  ],
  driverStatus: [
    { status: 'Active', count: 20 },
    { status: 'On Leave', count: 5 }
  ],
  monthlyPerformance: [
    { month: 'Jan', trips: 120, hours: 480, rating: 4.5 },
    { month: 'Feb', trips: 135, hours: 520, rating: 4.6 },
    { month: 'Mar', trips: 150, hours: 580, rating: 4.7 }
  ],
  driverDetails: [
    {
      id: 'DRV001',
      name: 'John Doe',
      status: 'Active',
      license: 'DL123456',
      experience: '5 years',
      rating: 4.5
    },
    {
      id: 'DRV002',
      name: 'Jane Smith',
      status: 'Active',
      license: 'DL789012',
      experience: '3 years',
      rating: 4.8
    }
  ]
};

// Financial Report Data
export const financialReportData = {
  totalRevenue: 150000,
  totalExpenses: 100000,
  netProfit: 50000,
  revenueBreakdown: [
    { category: 'Transport', amount: 90000 },
    { category: 'Maintenance', amount: 40000 },
    { category: 'Other', amount: 20000 }
  ],
  expenseBreakdown: [
    { category: 'Fuel', amount: 40000 },
    { category: 'Maintenance', amount: 30000 },
    { category: 'Salaries', amount: 20000 },
    { category: 'Other', amount: 10000 }
  ],
  monthlyFinancials: [
    { month: 'Jan', revenue: 45000, expenses: 30000, profit: 15000 },
    { month: 'Feb', revenue: 50000, expenses: 35000, profit: 15000 },
    { month: 'Mar', revenue: 55000, expenses: 35000, profit: 20000 }
  ],
  costPerVehicleType: [
    { type: 'Sedan', maintenance: 5000, fuel: 3000, total: 8000 },
    { type: 'SUV', maintenance: 7000, fuel: 4000, total: 11000 },
    { type: 'Van', maintenance: 6000, fuel: 3500, total: 9500 },
    { type: 'Truck', maintenance: 8000, fuel: 5000, total: 13000 }
  ],
  outstandingPayments: [
    {
      id: 'INV001',
      client: 'Client A',
      amount: 5000,
      dueDate: '2024-04-15',
      status: 'Pending'
    },
    {
      id: 'INV002',
      client: 'Client B',
      amount: 3000,
      dueDate: '2024-04-20',
      status: 'Overdue'
    }
  ]
};

// Operational Report Data
export const operationalReportData = {
  tripStatusDistribution: [
    { name: 'Completed', value: 65 },
    { name: 'In Progress', value: 20 },
    { name: 'Cancelled', value: 10 },
    { name: 'Delayed', value: 5 }
  ],
  monthlyOperations: [
    { month: 'Jan', trips: 120, onTimeRate: 85, cancellations: 5 },
    { month: 'Feb', trips: 150, onTimeRate: 88, cancellations: 3 },
    { month: 'Mar', trips: 180, onTimeRate: 90, cancellations: 2 },
    { month: 'Apr', trips: 160, onTimeRate: 87, cancellations: 4 },
    { month: 'May', trips: 200, onTimeRate: 92, cancellations: 1 },
    { month: 'Jun', trips: 220, onTimeRate: 94, cancellations: 2 }
  ],
  routeEfficiency: [
    { route: 'Route A', efficiency: 92 },
    { route: 'Route B', efficiency: 88 },
    { route: 'Route C', efficiency: 85 },
    { route: 'Route D', efficiency: 90 },
    { route: 'Route E', efficiency: 87 }
  ],
  resourceUtilization: [
    { resource: 'Trucks', utilization: 85 },
    { resource: 'Vans', utilization: 90 },
    { resource: 'Drivers', utilization: 88 },
    { resource: 'Warehouses', utilization: 75 },
    { resource: 'Equipment', utilization: 82 }
  ],
  maintenanceSchedule: [
    {
      vehicleId: 'TRK001',
      type: 'Truck',
      lastService: '2024-02-15',
      nextService: '2024-05-15',
      status: 'Scheduled'
    },
    {
      vehicleId: 'VAN002',
      type: 'Van',
      lastService: '2024-03-01',
      nextService: '2024-06-01',
      status: 'Scheduled'
    },
    {
      vehicleId: 'TRK003',
      type: 'Truck',
      lastService: '2024-01-20',
      nextService: '2024-04-20',
      status: 'Overdue'
    },
    {
      vehicleId: 'VAN004',
      type: 'Van',
      lastService: '2024-03-10',
      nextService: '2024-06-10',
      status: 'Scheduled'
    },
    {
      vehicleId: 'TRK005',
      type: 'Truck',
      lastService: '2024-02-28',
      nextService: '2024-05-28',
      status: 'Scheduled'
    }
  ]
}; 