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
    const formatLoanPurpose = (purposeValue) => {
        // Nếu purposeValue là số, chuyển thành văn bản tương ứng
        if (!isNaN(purposeValue)) {
            const purposes = {
                "1": "Mua nhà",
                "2": "Mua xe",
                "3": "Mua sắm",
                "4": "Đầu tư"
            };
            return purposes[purposeValue] || purposeValue;
        }
        // Nếu đã là văn bản, trả về nguyên bản
        return purposeValue;
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
                                    <p><strong>CCCD:</strong> {survey.IdentifyNumber}</p>
                                </div>
                                <div className="col-md-4 fs-5">
                                    <p><strong>Họ tên:</strong> {survey.Fullname}</p>
                                </div>
                                <div className="col-md-4 fs-5">
                                    <p><strong>Ngày sinh:</strong> {survey.DateOfBirth}</p>
                                </div>
                                <div className="col-md-4 fs-5">
                                    <p><strong>Số điện thoại:</strong> {survey.Phone}</p>
                                </div>
                                <div className="col-md-4 fs-5">
                                    <p><strong>Tỉnh/Thành phố:</strong> {locationMap?.provinces[survey.PermanentProvinceId] || survey.PermanentProvinceId}</p>
                                </div>
                                <div className="col-md-4 fs-5">
                                    <p><strong>Quận/Huyện:</strong> {locationMap?.districts[survey.PermanentDistrictId] || survey.PermanentDistrictId}</p>
                                </div>
                                <div className="col-md-4 fs-5">
                                    <p><strong>Xã/Phường:</strong> {locationMap?.wards[survey.PermanentWardId] || survey.PermanentWardId}</p>
                                </div>
                                <div className="col-md-12 fs-5">
                                    <p><strong>Địa chỉ:</strong> {survey.PermanentAddress}</p>
                                </div>
                            </div>

                            <div className="row mb-4">
                                <div className="col-12">
                                    <h4 className="text-primary border-bottom pb-2">Thông tin khoản vay</h4>
                                </div>
                                <div className="col-md-6 fs-5">
                                    <p><strong>Mục đích vay:</strong> {survey.LoanPurposeName}</p>
                                </div>
                                <div className="col-md-6 fs-5">
                                    <p><strong>Mô tả:</strong> {survey.Description}</p>
                                </div>
                                <div className="col-md-6 fs-5">
                                    <p><strong>Số tiền cần cho mục đích:</strong> {formatNumber(survey.PurposeAmount)} ₫</p>
                                </div>
                                <div className="col-md-6 fs-5">
                                    <p><strong>Số tiền đã có:</strong> {formatNumber(survey.HaveAmount)} ₫</p>
                                </div>
                                <div className="col-md-6 fs-5">
                                    <p><strong>Số tiền đề nghị vay:</strong> {formatNumber(survey.LoanAmountSuggest)} ₫</p>
                                </div>
                                <div className="col-md-6 fs-5">
                                    <p><strong>Tiết kiệm tự nguyện:</strong> {formatNumber(survey.VoluntaryDepositAmount)} ₫</p>
                                </div>
                            </div>

                            <div className="row mb-4">
                                <div className="col-12">
                                    <h4 className="text-primary border-bottom pb-2">Thông tin tài chính</h4>
                                </div>
                                <div className="col-md-4 fs-5">
                                    <p><strong>Thu nhập khách hàng:</strong> {formatNumber(survey.IncomeSalary)} ₫</p>
                                </div>
                                <div className="col-md-4 fs-5">
                                    <p><strong>Thu nhập khác:</strong> {formatNumber(survey.IncomeOther)} ₫</p>
                                </div>
                                <div className="col-md-4 fs-5">
                                    <p><strong>Tổng chi phí:</strong> {formatNumber(survey.Cost)} ₫</p>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-12">
                                    <h4 className="text-primary border-bottom pb-2">Thông tin hệ thống</h4>
                                </div>
                                <div className="col-md-6 fs-5">
                                    <p><strong>Ngày tạo:</strong> {formatDate(survey.CreatedAt)}</p>
                                </div>
                                <div className="col-md-6 fs-5">
                                    <p><strong>Cập nhật lần cuối:</strong> {formatDate(survey.UpdatedAt)}</p>
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