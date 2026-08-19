package com.zemenbank.fleetmanagement.enums;

import java.util.List;

import com.zemenbank.fleetmanagement.dto.report.JourneyStartInput;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PreApprovedRequestParameter {
    Long departmentId;
    List<JourneyStartInput> journeyStartInput;
    List<Long> travelerIds;
}
