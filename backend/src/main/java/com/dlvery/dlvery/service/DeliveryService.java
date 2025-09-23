package com.dlvery.dlvery.service;

import com.dlvery.dlvery.entity.Delivery;
import com.dlvery.dlvery.repository.DeliveryRepository;
import com.dlvery.dlvery.dto.DeliveryRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DeliveryService {

    private final DeliveryRepository deliveryRepository;

    @Transactional
    public Delivery createDelivery(DeliveryRequest request) {
        Delivery delivery = new Delivery();
        delivery.setOrderId(request.getOrderId());
        delivery.setCustomerName(request.getCustomerName());
        delivery.setCustomerAddress(request.getCustomerAddress());
        delivery.setDeliveryAgentId(request.getDeliveryAgentId());
        delivery.setStatus("PENDING");
        delivery.setDeliveryNotes(request.getDeliveryNotes());
        return deliveryRepository.save(delivery);
    }

    public List<Delivery> getAllDeliveries() {
        return deliveryRepository.findAll();
    }

    public Optional<Delivery> getDeliveryByOrderId(String orderId) {
        return deliveryRepository.findByOrderId(orderId);
    }

    @Transactional
    public Delivery updateDeliveryStatus(String orderId, String newStatus) {
        return deliveryRepository.findByOrderId(orderId).map(delivery -> {
            delivery.setStatus(newStatus);
            return deliveryRepository.save(delivery);
        }).orElseThrow(() -> new IllegalArgumentException("Delivery with Order ID " + orderId + " not found."));
    }
}