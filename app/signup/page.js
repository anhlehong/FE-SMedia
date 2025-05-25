"use client";
import Image from "next/image";
import useSignUp from "../hooks/useSignUp";
import {
  InputDate,
  InputPassword,
  InputRadioButton,
  InputSubmit,
  InputText,
  InputOTP,
} from "../components/login_signup";

import useSWR from "swr";
import Link from "next/link";
import {
  GraduationCap,
  Users,
  BookOpen,
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  Facebook,
  Chrome,
} from "lucide-react";
import { useState } from "react";

export default function SignUp() {
  const SUBMIT_LABEL = "Đăng ký";
  const SURNAME_LABEL = "Họ + Tên Đệm";
  const GIVEN_NAME_LABEL = "Tên chính";
  const BIRTH_LABEL = "Ngày sinh";
  const FEMALE_LABEL = "Nữ";
  const MALE_LABEL = "Nam";
  const EMAIL_LABEL = "Email của trường";
  const PASSWORD_LABEL = "Mật khẩu";
  const REPASSWORD_LABEL = "Nhập lại mật khẩu";
  const {
    formData,
    formValidation,
    formError,
    formSuccess,
    isSubmitting,
    showOtpForm,
    autoSubmitting,
    handleChange,
    handleSubmit,
    resetOtpForm,
    handleOtpComplete,
  } = useSignUp();
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-40">
        <div
          className="w-full h-full bg-gradient-to-br from-blue-100/20 to-indigo-100/20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%233b82f6' fillOpacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "60px 60px",
          }}
        ></div>
      </div>

      <div className="relative w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding & Info */}
        <div className="hidden lg:block space-y-8">
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-2xl">
                <GraduationCap className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              HCMUE
              <span className="block text-2xl lg:text-3xl font-semibold text-blue-600 mt-2">
                Social Network
              </span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Mạng xã hội dành riêng cho cộng đồng sinh viên và giảng viên
              <br />
              <span className="font-semibold text-indigo-600">
                Đại học Sư phạm Thành phố Hồ Chí Minh
              </span>
            </p>
          </div>

          {/* Features */}
          <div className="space-y-6">
            <div className="flex items-center space-x-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-blue-200">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Kết nối cộng đồng
                </h3>
                <p className="text-sm text-gray-600">
                  Giao lưu với bạn bè và giảng viên
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-indigo-200">
              <div className="bg-indigo-100 p-3 rounded-lg">
                <BookOpen className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Chia sẻ học tập</h3>
                <p className="text-sm text-gray-600">
                  Trao đổi tài liệu và kinh nghiệm
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-blue-200">
              <div className="bg-blue-100 p-3 rounded-lg">
                <GraduationCap className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Hoạt động học thuật
                </h3>
                <p className="text-sm text-gray-600">
                  Cập nhật tin tức và sự kiện
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          <div className="bg-white/80 backdrop-blur-md border-0 shadow-2xl rounded-md px-10 py-6">
            <div className="text-center pb-4">
              <div className="flex justify-center mb-4 lg:hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {showOtpForm ? "Xác thực OTP" : "Đăng ký"}
              </div>
              <div className="text-gray-600">
                Truy cập vào mạng xã hội HCMUE
              </div>
            </div>

            <div className="space-y-2">
              {/* Login Form */}
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
              >
                <div className="flex flex-col justify-center items-center space-y-3">
                  {showOtpForm ? (
                    /* OTP Verification Form */
                    <>
                      {" "}
                      <div
                        className={`${
                          autoSubmitting
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-700"
                        } p-3 rounded-md w-full mb-2`}
                      >
                        <p className="font-semibold">Email đã được đăng ký!</p>
                        <p className="text-sm">
                          Vui lòng kiểm tra email của bạn để lấy mã xác thực
                          OTP.
                        </p>
                        <p className="text-sm font-semibold mt-1">
                          {autoSubmitting
                            ? "Đang xác thực mã OTP..."
                            : "Mã OTP sẽ tự động xác thực khi bạn nhập đủ 6 chữ số."}
                        </p>
                      </div>
                      <InputOTP
                        name={"otp"}
                        onChangeEvent={handleChange}
                        isValid={formValidation.otp}
                        value={formData.otp}
                        onComplete={handleOtpComplete}
                      />
                      {autoSubmitting && (
                        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mt-2">
                          <p className="text-sm md:text-base flex items-center justify-center">
                            <span className="animate-spin mr-2">⟳</span> Đang
                            xác thực OTP...
                          </p>
                        </div>
                      )}
                      {formError && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                          <p className="text-sm md:text-base">{formError}</p>
                        </div>
                      )}
                      {formSuccess && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                          <p className="text-sm md:text-base flex items-center justify-center">
                            <span className="mr-2">✓</span> {formSuccess}
                          </p>
                        </div>
                      )}
                      {/* <InputSubmit
                        label={isSubmitting ? "Đang xử lý..." : "Xác thực OTP"}
                        disabled={isSubmitting || autoSubmitting}
                      /> */}
                      <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 font-semibold flex rounded-md justify-center items-center"
                        disabled={isSubmitting || autoSubmitting}
                      >
                        {isSubmitting ? "Đang xử lý..." : "Xác thực OTP"}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </button>
                      <button
                        type="button"
                        onClick={resetOtpForm}
                        className="text-white underline mt-2"
                        disabled={isSubmitting || autoSubmitting || formSuccess}
                      >
                        Quay lại chỉnh sửa thông tin
                      </button>
                    </>
                  ) : (
                    /* Initial Registration Form */
                    <>
                      <div className="flex flex-row space-x-1 w-full">
                        {" "}
                        <InputText
                          name={"surname"}
                          onChangeEvent={handleChange}
                          label={SURNAME_LABEL}
                          isValid={formValidation.surname}
                          value={formData.surname}
                        />
                        <InputText
                          name="givenName"
                          onChangeEvent={handleChange}
                          label={GIVEN_NAME_LABEL}
                          isValid={formValidation.givenName}
                          value={formData.givenName}
                        />
                      </div>{" "}
                      <InputDate
                        name={"birthday"}
                        onChangeEvent={handleChange}
                        label={BIRTH_LABEL}
                        isValid={formValidation.birthday}
                        value={formData.birthday}
                      />
                      <div className="w-full">
                        <h2 className="text-gray-700 mb-1 text-sm">
                          Giới tính
                        </h2>
                        <div className="w-full flex flex-row space-x-1">
                          {" "}
                          <InputRadioButton
                            name={"gender"}
                            onChangeEvent={handleChange}
                            label={MALE_LABEL}
                            value={"male"}
                            isValid={formValidation.gender}
                            checked={formData.gender === "male"}
                          />
                          <InputRadioButton
                            name={"gender"}
                            onChangeEvent={handleChange}
                            label={FEMALE_LABEL}
                            value={"female"}
                            isValid={formValidation.gender}
                            checked={formData.gender === "female"}
                          />
                        </div>
                      </div>{" "}
                      <InputText
                        name={"email"}
                        onChangeEvent={handleChange}
                        label={EMAIL_LABEL}
                        isValid={formValidation.email}
                        value={formData.email}
                      />
                      <InputPassword
                        name={"password"}
                        onChangeEvent={handleChange}
                        label={PASSWORD_LABEL}
                        isValid={formValidation.password}
                        value={formData.password}
                      />
                      <InputPassword
                        name={"repassword"}
                        onChangeEvent={handleChange}
                        label={REPASSWORD_LABEL}
                        isValid={formValidation.repassword}
                        value={formData.repassword}
                      />
                      {formError && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                          <p className="text-sm md:text-base">{formError}</p>
                        </div>
                      )}
                      {/* <InputSubmit
                        label={isSubmitting ? "Đang xử lý..." : SUBMIT_LABEL}
                        
                      /> */}
                      <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 font-semibold flex rounded-md justify-center items-center"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Đang xử lý..." : SUBMIT_LABEL}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </button>
                    </>
                  )}
                </div>
              </form>

              {/* Sign Up Link */}
              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Đã có tài khoản?{" "}
                  {/* <button className="">
                        Đăng ký ngay
                      </button> */}
                  <Link
                    href="/signin"
                    className="text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    {" "}
                    Đăng nhập ngay
                  </Link>
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Dành cho sinh viên và giảng viên HCMUE
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 text-sm text-gray-500">
            <p>© 2025 Đại học Sư phạm TP.HCM</p>
            <div className="flex justify-center space-x-4 mt-2">
              <button className="hover:text-blue-600">Điều khoản</button>
              <button className="hover:text-blue-600">Bảo mật</button>
              <button className="hover:text-blue-600">Hỗ trợ</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    // <div className="relative w-screen h-screen">
    //   <Image
    //     src="/background-login.png"
    //     fill
    //     sizes="100vw"
    //     alt="background-login-hcmue"
    //     quality={100}
    //     style={{ objectFit: "contain" }}
    //   />
    //   <form
    //     className="inline-block w-full relative top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sm rounded-lg p-10 bg-slate-600 hover:shadow-lg hover:shadow-slate-500/50  md:w-5/6 lg:text-base lg:w-1/3 "
    //     onSubmit={(e) => {
    //       e.preventDefault();
    //       handleSubmit();
    //     }}
    //   >
    //     <h1 className="text-white text-4xl font-bold text-center mb-6">
    //       {showOtpForm ? "Xác thực OTP" : "Đăng ký"}
    //     </h1>
    //     <div className="flex flex-col justify-center items-center space-y-3">
    //       {showOtpForm ? (
    //         /* OTP Verification Form */
    //         <>
    //           {" "}
    //           <div
    //             className={`${
    //               autoSubmitting
    //                 ? "bg-yellow-100 text-yellow-800"
    //                 : "bg-blue-100 text-blue-700"
    //             } p-3 rounded-md w-full mb-2`}
    //           >
    //             <p className="font-semibold">Email đã được đăng ký!</p>
    //             <p className="text-sm">
    //               Vui lòng kiểm tra email của bạn để lấy mã xác thực OTP.
    //             </p>
    //             <p className="text-sm font-semibold mt-1">
    //               {autoSubmitting
    //                 ? "Đang xác thực mã OTP..."
    //                 : "Mã OTP sẽ tự động xác thực khi bạn nhập đủ 6 chữ số."}
    //             </p>
    //           </div>
    //           <InputOTP
    //             name={"otp"}
    //             onChangeEvent={handleChange}
    //             isValid={formValidation.otp}
    //             value={formData.otp}
    //             onComplete={handleOtpComplete}
    //           />
    //           {autoSubmitting && (
    //             <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mt-2">
    //               <p className="text-sm md:text-base flex items-center justify-center">
    //                 <span className="animate-spin mr-2">⟳</span> Đang xác thực
    //                 OTP...
    //               </p>
    //             </div>
    //           )}
    //           {formError && (
    //             <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
    //               <p className="text-sm md:text-base">{formError}</p>
    //             </div>
    //           )}
    //           {formSuccess && (
    //             <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
    //               <p className="text-sm md:text-base flex items-center justify-center">
    //                 <span className="mr-2">✓</span> {formSuccess}
    //               </p>
    //             </div>
    //           )}
    //           <InputSubmit
    //             label={isSubmitting ? "Đang xử lý..." : "Xác thực OTP"}
    //             disabled={isSubmitting || autoSubmitting}
    //           />
    //           <button
    //             type="button"
    //             onClick={resetOtpForm}
    //             className="text-white underline mt-2"
    //             disabled={isSubmitting || autoSubmitting || formSuccess}
    //           >
    //             Quay lại chỉnh sửa thông tin
    //           </button>
    //         </>
    //       ) : (
    //         /* Initial Registration Form */
    //         <>
    //           <div className="flex flex-row space-x-1 w-full">
    //             {" "}
    //             <InputText
    //               name={"surname"}
    //               onChangeEvent={handleChange}
    //               label={SURNAME_LABEL}
    //               isValid={formValidation.surname}
    //               value={formData.surname}
    //             />
    //             <InputText
    //               name="givenName"
    //               onChangeEvent={handleChange}
    //               label={GIVEN_NAME_LABEL}
    //               isValid={formValidation.givenName}
    //               value={formData.givenName}
    //             />
    //           </div>{" "}
    //           <InputDate
    //             name={"birthday"}
    //             onChangeEvent={handleChange}
    //             label={BIRTH_LABEL}
    //             isValid={formValidation.birthday}
    //             value={formData.birthday}
    //           />
    //           <div className="w-full">
    //             <h2 className="text-white mt-2 mb-1 text-sm">Giới tính</h2>
    //             <div className="w-full flex flex-row space-x-1">
    //               {" "}
    //               <InputRadioButton
    //                 name={"gender"}
    //                 onChangeEvent={handleChange}
    //                 label={MALE_LABEL}
    //                 value={"male"}
    //                 isValid={formValidation.gender}
    //                 checked={formData.gender === "male"}
    //               />
    //               <InputRadioButton
    //                 name={"gender"}
    //                 onChangeEvent={handleChange}
    //                 label={FEMALE_LABEL}
    //                 value={"female"}
    //                 isValid={formValidation.gender}
    //                 checked={formData.gender === "female"}
    //               />
    //             </div>
    //           </div>{" "}
    //           <InputText
    //             name={"email"}
    //             onChangeEvent={handleChange}
    //             label={EMAIL_LABEL}
    //             isValid={formValidation.email}
    //             value={formData.email}
    //           />
    //           <InputPassword
    //             name={"password"}
    //             onChangeEvent={handleChange}
    //             label={PASSWORD_LABEL}
    //             isValid={formValidation.password}
    //             value={formData.password}
    //           />
    //           <InputPassword
    //             name={"repassword"}
    //             onChangeEvent={handleChange}
    //             label={REPASSWORD_LABEL}
    //             isValid={formValidation.repassword}
    //             value={formData.repassword}
    //           />
    //           {formError && (
    //             <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
    //               <p className="text-sm md:text-base">{formError}</p>
    //             </div>
    //           )}
    //           <InputSubmit
    //             label={isSubmitting ? "Đang xử lý..." : SUBMIT_LABEL}
    //             disabled={isSubmitting}
    //           />
    //         </>
    //       )}
    //     </div>
    //   </form>
    // </div>
  );
}
