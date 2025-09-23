package com.dlvery.dlvery.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class DeliveryReportRequest {
    private LocalDate startDate;
    private LocalDate endDate;
}