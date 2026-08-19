const RequestStatus= Object.freeze({
    PENDING: 0,
    APPROVED: 1,
    REJECTED: 2,
    VEHICLE_ASSIGNED:3,
    VEHICLE_APPROVED:4,
    IN_TRIP:5,
    TRIP_COMPLETED:6,
    MERGED:7
});

export default RequestStatus;