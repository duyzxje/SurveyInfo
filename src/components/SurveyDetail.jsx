import React from 'react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

const SurveyDetail = ({ survey, onClose, locationMap }) => {
    if (!survey) return null;

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN');
    };

    // Format loan purpose
    const formatLoanPurpose = (purposeId) => {
        const purposes = {
            "1": "Mua nhà",
            "2": "Mua xe",
            "3": "Mua sắm",
            "4": "Đầu tư"
        };
        return purposes[purposeId] || purposeId;
    };

    // Format number with thousand separators
    const formatNumber = (value) => {
        if (!value) return '0';
        return Number(value).toLocaleString('en-US');
    };

    return (
        <div className="modal show" style={{ display: "block", background: "#00000080" }}>
            <div className="modal-dialog modal-xl modal-dialog-scrollable" style={{ top: "100px" }}>
                <div className="modal-content">
                    <div className="modal-header bg-primary text-white">
                        <h5 className="modal-title">Chi tiết khảo sát</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <div className="container-fluid">
                            <div className="row mb-4">
                                <div className="col-12">
                                    <h4 className="text-primary border-bottom pb-2">Thông tin cá nhân</h4>
                                </div>
                                <div className="col-md-4 fs-5">
                                    <p><strong>CCCD:</strong> {survey.identify}</p>
                                </div>
                                <div className="col-md-4 fs-5">
                                    <p><strong>Họ tên:</strong> {survey.fullname}</p>
                                </div>
                                <div className="col-md-4 fs-5">
                                    <p><strong>Số điện thoại:</strong> {survey.phone}</p>
                                </div>
                                <div className="col-md-4 fs-5">
                                    <p><strong>Tỉnh/Thành phố:</strong> {locationMap?.provinces[survey.provinceId] || survey.provinceId}</p>
                                </div>
                                <div className="col-md-4 fs-5">
                                    <p><strong>Quận/Huyện:</strong> {locationMap?.districts[survey.districtId] || survey.districtId}</p>
                                </div>
                                <div className="col-md-4 fs-5">
                                    <p><strong>Xã/Phường:</strong> {locationMap?.wards[survey.wardId] || survey.wardId}</p>
                                </div>
                                <div className="col-md-12 fs-5">
                                    <p><strong>Địa chỉ:</strong> {survey.address}</p>
                                </div>
                            </div>

                            <div className="row mb-4">
                                <div className="col-12">
                                    <h4 className="text-primary border-bottom pb-2">Thông tin khoản vay</h4>
                                </div>
                                <div className="col-md-6 fs-5">
                                    <p><strong>Mục đích vay:</strong> {formatLoanPurpose(survey.purposeLoan)}</p>
                                </div>
                                <div className="col-md-6 fs-5">
                                    <p><strong>Mô tả:</strong> {survey.description}</p>
                                </div>
                                <div className="col-md-6 fs-5">
                                    <p><strong>Số tiền cần cho mục đích:</strong> {formatNumber(survey.amountPurpose)} ₫</p>
                                </div>
                                <div className="col-md-6 fs-5">
                                    <p><strong>Số tiền đã có:</strong> {formatNumber(survey.amountHave)} ₫</p>
                                </div>
                                <div className="col-md-6 fs-5">
                                    <p><strong>Số tiền đề nghị vay:</strong> {formatNumber(survey.amountSuggest)} ₫</p>
                                </div>
                                <div className="col-md-6 fs-5">
                                    <p><strong>Tiết kiệm tự nguyện:</strong> {formatNumber(survey.voluntarySaving)} ₫</p>
                                </div>
                            </div>

                            <div className="row mb-4">
                                <div className="col-12">
                                    <h4 className="text-primary border-bottom pb-2">Thông tin tài chính</h4>
                                </div>
                                <div className="col-md-4 fs-5">
                                    <p><strong>Thu nhập khách hàng:</strong> {formatNumber(survey.incomeSalary)} ₫</p>
                                </div>
                                <div className="col-md-4 fs-5">
                                    <p><strong>Thu nhập khác:</strong> {formatNumber(survey.incomeOther)} ₫</p>
                                </div>
                                <div className="col-md-4 fs-5">
                                    <p><strong>Tổng chi phí:</strong> {formatNumber(survey.cost)} ₫</p>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-12">
                                    <h4 className="text-primary border-bottom pb-2">Thông tin hệ thống</h4>
                                </div>
                                <div className="col-md-6 fs-5">
                                    <p><strong>Ngày tạo:</strong> {formatDate(survey.createdAt)}</p>
                                </div>
                                <div className="col-md-6 fs-5">
                                    <p><strong>Cập nhật lần cuối:</strong> {formatDate(survey.updatedAt)}</p>
                                </div>
                                {survey.listName && (
                                    <div className="col-md-6 fs-5">
                                        <p><strong>Danh sách:</strong> {survey.listName}</p>
                                    </div>
                                )}
                                {survey.importFileName && (
                                    <div className="col-md-6 fs-5">
                                        <p><strong>Tên file nhập:</strong> {survey.importFileName}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary btn-lg" onClick={onClose}>Đóng</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SurveyDetail;