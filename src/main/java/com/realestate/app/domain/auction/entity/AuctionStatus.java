package com.realestate.app.domain.auction.entity;

public enum AuctionStatus {
    ONGOING,   // 진행중
    CLOSED,    // 기한 지남(수락 없음)
    COMPLETED  // 특정 오퍼 수락됨
}