package com.zemenbank.fleetmanagement.enums;

public class RoleType {
    public static final String EMPLOYEE = "EMPLOYEE";
    public static final String DEPARTMENT_HEAD = "DEPARTMENT_HEAD";
    public static final String LOGISTICS_OFFICER = "LOGISTICS_OFFICER";
    public static final String LOGISTICS_HEAD = "LOGISTICS_HEAD";
    public static final String ADMIN = "ADMIN";
    public static final String MAINTENANCE_REQUESTER = "MAINTENANCE_REQUESTER";

    // Private constructor to prevent instantiation
    private RoleType() {
        throw new UnsupportedOperationException("This is a utility class and cannot be instantiated");
    }
    
}
