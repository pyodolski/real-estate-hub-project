package com.realestate.app.domain.property.service;

import com.realestate.app.domain.property.dto.PropertyWithOffersDto;
import com.realestate.app.domain.property.repository.PropertyOfferRepository;
import com.realestate.app.domain.property.repository.PropertywoRepository;
import com.realestate.app.domain.property.table.Property;
import com.realestate.app.domain.property.table.PropertyOffer;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PropertyQueryService {

    private final PropertywoRepository propertyRepository;
    private final PropertyOfferRepository offerRepository;

    /* 전체 목록(내 것 + 타인 것 모두 포함)  */
    public Page<PropertyWithOffersDto> list(
            Integer page, Integer size, String sort,  // "createdAt,desc" / "price,asc;createdAt,desc"
            String status, String listingType
    ) {
        Pageable pageable = PageRequest.of(normalizePage(page), normalizeSize(size), parseSort(sort));

        Page<Property> propPage;
        boolean hasStatus = hasText(status);
        boolean hasType   = hasText(listingType);

        if (hasStatus && hasType) {
            propPage = propertyRepository.findAllByStatusAndListingType(
                    parseStatus(status),
                    parseType(listingType),
                    pageable
            );
        } else if (hasStatus) {
            propPage = propertyRepository.findAllByStatus(
                    parseStatus(status), pageable
            );
        } else if (hasType) {
            propPage = propertyRepository.findAllByListingType(
                    parseType(listingType), pageable
            );
        } else {
            propPage = propertyRepository.findAll(pageable);
        }

        return toPageDto(propPage, pageable);
    }

    /* 내 매물만 */
    public Page<PropertyWithOffersDto> listMyProperties(
            Long ownerId,
            Integer page, Integer size, String sort,
            String status, String listingType
    ) {
        Pageable pageable = PageRequest.of(normalizePage(page), normalizeSize(size), parseSort(sort));

        Page<Property> propPage;
        boolean hasStatus = hasText(status);
        boolean hasType   = hasText(listingType);

        if (hasStatus && hasType) {
            propPage = propertyRepository.findAllByOwner_IdAndStatusAndListingType(
                    ownerId, parseStatus(status), parseType(listingType), pageable
            );
        } else if (hasStatus) {
            propPage = propertyRepository.findAllByOwner_IdAndStatus(
                    ownerId, parseStatus(status), pageable
            );
        } else if (hasType) {
            propPage = propertyRepository.findAllByOwner_IdAndListingType(
                    ownerId, parseType(listingType), pageable
            );
        } else {
            propPage = propertyRepository.findAllByOwner_Id(ownerId, pageable);
        }

        return toPageDto(propPage, pageable);
    }

    /* 타인 매물만(내 것 제외) */
    public Page<PropertyWithOffersDto> listOthers(
            Long viewerId,                             // 로그인 필수 컨트롤러에서 검증
            Integer page, Integer size, String sort,
            String status, String listingType
    ) {
        Pageable pageable = PageRequest.of(normalizePage(page), normalizeSize(size), parseSort(sort));

        Page<Property> propPage;
        boolean hasStatus = hasText(status);
        boolean hasType   = hasText(listingType);

        if (hasStatus && hasType) {
            propPage = propertyRepository.findAllByOwner_IdNotAndStatusAndListingType(
                    viewerId, parseStatus(status), parseType(listingType), pageable
            );
        } else if (hasStatus) {
            propPage = propertyRepository.findAllByOwner_IdNotAndStatus(
                    viewerId, parseStatus(status), pageable
            );
        } else if (hasType) {
            propPage = propertyRepository.findAllByOwner_IdNotAndListingType(
                    viewerId, parseType(listingType), pageable
            );
        } else {
            propPage = propertyRepository.findAllByOwner_IdNot(viewerId, pageable);
        }

        return toPageDto(propPage, pageable);
    }

    /* 상세(타인 포함) */
    public PropertyWithOffersDto detail(Long propertyId) {
        Property p = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new NoSuchElementException("Property not found: " + propertyId));
        List<PropertyOffer> offers = offerRepository.findByPropertyId(propertyId);
        return toDto(p, offers);
    }


    private int normalizePage(Integer page) {
        return (page == null || page < 0) ? 0 : page;
    }

    private int normalizeSize(Integer size) {
        return (size == null || size < 1 || size > 100) ? 20 : size;
    }

    private boolean hasText(String s) {
        return s != null && !s.isBlank();
    }

    // "price,asc;createdAt,desc" 형태 지원. 방향 생략 시 asc.
    private Sort parseSort(String sort) {
        if (!hasText(sort)) {
            return Sort.by(Sort.Direction.DESC, "createdAt");
        }
        List<Sort.Order> orders = new ArrayList<>();
        for (String part : sort.split(";")) {
            String[] t = part.split(",");
            String prop = t[0].trim();
            Sort.Direction dir = (t.length > 1 && "desc".equalsIgnoreCase(t[1].trim()))
                    ? Sort.Direction.DESC
                    : Sort.Direction.ASC;
            orders.add(new Sort.Order(dir, prop));
        }
        return Sort.by(orders);
    }

    private Property.Status parseStatus(String s){
        if (!hasText(s)) return null;
        try { return Property.Status.valueOf(s); } catch (Exception e){ return null; }
    }

    private Property.ListingType parseType(String s){
        if (!hasText(s)) return null;
        try { return Property.ListingType.valueOf(s); } catch (Exception e){ return null; }
    }

    private Page<PropertyWithOffersDto> toPageDto(Page<Property> propPage, Pageable pageable) {
        List<Long> ids = propPage.getContent().stream().map(Property::getId).toList();
        Map<Long, List<PropertyOffer>> offersByPid = ids.isEmpty()
                ? Collections.emptyMap()
                : offerRepository.findByPropertyIdIn(ids).stream()
                .collect(Collectors.groupingBy(o -> o.getProperty().getId()));

        List<PropertyWithOffersDto> dtoList = propPage.getContent().stream()
                .map(pv -> toDto(pv, offersByPid.getOrDefault(pv.getId(), List.of())))
                .toList();

        return new PageImpl<>(dtoList, pageable, propPage.getTotalElements());
    }

    private PropertyWithOffersDto toDto(Property p, List<PropertyOffer> offers) {
        return new PropertyWithOffersDto(
                p.getId(),
                p.getTitle(),
                p.getAddress(),
                p.getPrice(),
                p.getAreaM2(),
                p.getStatus() != null ? p.getStatus().name() : null,
                p.getListingType() != null ? p.getListingType().name() : null,
                p.getOwner() != null ? p.getOwner().getId() : null,
                p.getBroker() != null && p.getBroker().getUser() != null ? p.getBroker().getUser().getId() : null,
                p.getClaim() != null ? p.getClaim().getId() : null,
                p.getRegionCode(),
                p.getLocationX(),
                p.getLocationY(),
                p.getBuildingYear(),
                p.getAnomalyAlert(),
                p.getCreatedAt(),
                p.getUpdatedAt(),
                offers.stream().map(this::toOfferDto).toList()
        );
    }

    private PropertyWithOffersDto.OfferDto toOfferDto(PropertyOffer o) {
        return new PropertyWithOffersDto.OfferDto(
                o.getId(),
                o.getHousetype() != null ? o.getHousetype().name() : null,
                o.getType() != null ? o.getType().name() : null,
                o.getFloor(),
                o.getOftion(),
                o.getTotalPrice(),
                o.getDeposit(),
                o.getMonthlyRent(),
                o.getMaintenanceFee(),
                o.getNegotiable(),
                o.getAvailableFrom(),
                o.getIsActive(),
                o.getCreatedAt(),
                o.getUpdatedAt()
        );
    }
}
