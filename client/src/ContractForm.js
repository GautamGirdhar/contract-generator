import React, { useState } from "react";
import "./ContractForm.css";

const ContractForm = () => {
  const [type, setType] = useState("Offer Letter");
  const [fields, setFields] = useState({
    // Company fields
    companyName: "",
    companyAddress: "",
    logoImage: "",
    signatureImage: "",
    // Owner fields
    ownerName: "",
    ownerAddress: "",
    ownerSignature: "",
    // Tenant/Recipient fields
    recipientName: "",
    tenantSignature: "",
    // Employment fields
    position: "",
    location: "",
    startDate: "",
    workingDays: "",
    workingHours: "",
    compensation: "",
    benefits: "",
    // Rental fields
    propertyAddress: "",
    rentAmount: "",
    duration: "",
    securityDeposit: "",
    utilities: "",
    // Freelance fields
    projectScope: "",
    deliverables: "",
    paymentTerms: "",
    revisions: "",
    // Common fields
    additionalTerms: "",
  });
  const [contract, setContract] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [documentUrl, setDocumentUrl] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleImageUpload = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFields((prev) => ({ ...prev, [fieldName]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const getRequiredFields = () => {
    switch (type) {
      case "Rental Contract":
        return [
          "ownerName",
          "ownerAddress",
          "recipientName",
          "propertyAddress",
          "rentAmount",
          "duration",
          // Removed signature requirements to make testing easier
          // "ownerSignature",
          // "tenantSignature"
        ];
      case "Freelance Contract":
        return [
          "companyName",
          "recipientName",
          "projectScope",
          "deliverables",
          "paymentTerms",
          // Removed logo and signature requirements
          // "logoImage",
          // "signatureImage"
        ];
      default: // Offer Letter & Employment Contract
        return [
          "companyName",
          "recipientName",
          "position",
          "startDate",
          "compensation",
          "workingHours",
          // Removed logo and signature requirements
          // "logoImage",
          // "signatureImage"
        ];
    }
  };

  const validateForm = () => {
    const requiredFields = getRequiredFields();
    const missingFields = requiredFields.filter((field) => !fields[field]);

    if (missingFields.length > 0) {
      setError(
        `Please fill in all required fields: ${missingFields.join(", ")}`
      );
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/generate-contract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type: type, fields }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setContract(data.contract);

      // Store the document URL for download button
      if (data.fileUrl) {
        setDocumentUrl(`http://localhost:5000${data.fileUrl}`);
      }
    } catch (error) {
      setError(error.message || "Failed to generate contract");
    } finally {
      setLoading(false);
    }
  };

  // Added a download function
  const handleDownload = () => {
    if (documentUrl) {
      const link = document.createElement("a");
      link.href = documentUrl;
      link.download = documentUrl.split("/").pop();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const renderFields = () => {
    switch (type) {
      case "Rental Contract":
        return (
          <>
            <div className="form-group">
              <h3>Owner Information</h3>
              <label>
                Owner Name*
                <input
                  name="ownerName"
                  value={fields.ownerName}
                  onChange={handleChange}
                  placeholder="Full legal name"
                />
              </label>
              <label>
                Owner Address*
                <input
                  name="ownerAddress"
                  value={fields.ownerAddress}
                  onChange={handleChange}
                  placeholder="Complete address"
                />
              </label>
              <label>
                Owner Signature
                <input
                  type="file"
                  name="ownerSignature"
                  onChange={(e) => handleImageUpload(e, "ownerSignature")}
                  accept="image/*"
                />
              </label>
            </div>
            <div className="form-group">
              <h3>Property Information</h3>
              <label>
                Property Address*
                <input
                  name="propertyAddress"
                  value={fields.propertyAddress}
                  onChange={handleChange}
                  placeholder="Complete property address"
                />
              </label>
              <label>
                Monthly Rent*
                <input
                  name="rentAmount"
                  value={fields.rentAmount}
                  onChange={handleChange}
                  placeholder="e.g., ₹25,000"
                />
              </label>
              <label>
                Lease Duration*
                <input
                  name="duration"
                  value={fields.duration}
                  onChange={handleChange}
                  placeholder="e.g., 11 months"
                />
              </label>
              <label>
                Security Deposit
                <input
                  name="securityDeposit"
                  value={fields.securityDeposit}
                  onChange={handleChange}
                  placeholder="e.g., ₹50,000"
                />
              </label>
              <label>
                Utilities Included
                <input
                  name="utilities"
                  value={fields.utilities}
                  onChange={handleChange}
                  placeholder="e.g., Water, Electricity"
                />
              </label>
            </div>
            <div className="form-group">
              <h3>Tenant Signature</h3>
              <label>
                Tenant Signature
                <input
                  type="file"
                  name="tenantSignature"
                  onChange={(e) => handleImageUpload(e, "tenantSignature")}
                  accept="image/*"
                />
              </label>
            </div>
          </>
        );

      case "Freelance Contract":
        return (
          <>
            <div className="form-group">
              <h3>Company Information</h3>
              <label>
                Company Name*
                <input
                  name="companyName"
                  value={fields.companyName}
                  onChange={handleChange}
                  placeholder="Legal company name"
                />
              </label>
              <label>
                Company Address
                <input
                  name="companyAddress"
                  value={fields.companyAddress}
                  onChange={handleChange}
                  placeholder="Complete company address"
                />
              </label>
              <label>
                Company Logo
                <input
                  type="file"
                  name="logoImage"
                  onChange={(e) => handleImageUpload(e, "logoImage")}
                  accept="image/*"
                />
              </label>
              <label>
                Authorized Signature
                <input
                  type="file"
                  name="signatureImage"
                  onChange={(e) => handleImageUpload(e, "signatureImage")}
                  accept="image/*"
                />
              </label>
            </div>
            <div className="form-group">
              <h3>Project Details</h3>
              <label>
                Project Scope*
                <textarea
                  name="projectScope"
                  value={fields.projectScope}
                  onChange={handleChange}
                  placeholder="Detailed description of the project scope"
                />
              </label>
              <label>
                Deliverables*
                <textarea
                  name="deliverables"
                  value={fields.deliverables}
                  onChange={handleChange}
                  placeholder="List all deliverables"
                />
              </label>
              <label>
                Payment Terms*
                <textarea
                  name="paymentTerms"
                  value={fields.paymentTerms}
                  onChange={handleChange}
                  placeholder="Payment schedule and terms"
                />
              </label>
              <label>
                Revision Policy
                <textarea
                  name="revisions"
                  value={fields.revisions}
                  onChange={handleChange}
                  placeholder="Number of revisions included"
                />
              </label>
            </div>
          </>
        );

      default: // Offer Letter & Employment Contract
        return (
          <>
            <div className="form-group">
              <h3>Company Information</h3>
              <label>
                Company Name*
                <input
                  name="companyName"
                  value={fields.companyName}
                  onChange={handleChange}
                  placeholder="Legal company name"
                />
              </label>
              <label>
                Company Address
                <input
                  name="companyAddress"
                  value={fields.companyAddress}
                  onChange={handleChange}
                  placeholder="Complete company address"
                />
              </label>
              <label>
                Company Logo
                <input
                  type="file"
                  name="logoImage"
                  onChange={(e) => handleImageUpload(e, "logoImage")}
                  accept="image/*"
                />
              </label>
              <label>
                Authorized Signature
                <input
                  type="file"
                  name="signatureImage"
                  onChange={(e) => handleImageUpload(e, "signatureImage")}
                  accept="image/*"
                />
              </label>
            </div>
            <div className="form-group">
              <h3>Employment Details</h3>
              <label>
                Position*
                <input
                  name="position"
                  value={fields.position}
                  onChange={handleChange}
                  placeholder="Job title or role"
                />
              </label>
              <label>
                Office Location
                <input
                  name="location"
                  value={fields.location}
                  onChange={handleChange}
                  placeholder="Work location"
                />
              </label>
              <label>
                Start Date*
                <input
                  name="startDate"
                  value={fields.startDate}
                  onChange={handleChange}
                  type="date"
                />
              </label>
              <label>
                Duration
                <input
                  name="duration"
                  value={fields.duration}
                  onChange={handleChange}
                  placeholder="e.g., 6 months, 1 year"
                />
              </label>
            </div>
            <div className="form-group">
              <h3>Work Schedule</h3>
              <label>
                Working Days
                <input
                  name="workingDays"
                  value={fields.workingDays}
                  onChange={handleChange}
                  placeholder="e.g., Monday to Friday"
                />
              </label>
              <label>
                Working Hours*
                <input
                  name="workingHours"
                  value={fields.workingHours}
                  onChange={handleChange}
                  placeholder="e.g., 9:00 AM to 6:00 PM"
                />
              </label>
            </div>
            <div className="form-group">
              <h3>Compensation</h3>
              <label>
                Compensation*
                <input
                  name="compensation"
                  value={fields.compensation}
                  onChange={handleChange}
                  placeholder="e.g., ₹75,000 per month"
                />
              </label>
              <label>
                Benefits
                <textarea
                  name="benefits"
                  value={fields.benefits}
                  onChange={handleChange}
                  placeholder="List all benefits, one per line"
                />
              </label>
            </div>
          </>
        );
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          Document Type
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="Offer Letter">Offer Letter</option>
            <option value="Employment Contract">Employment Contract</option>
            <option value="Rental Contract">Rental Contract</option>
            <option value="Freelance Contract">Freelance Contract</option>
          </select>
        </label>

        <div className="form-group">
          <h3>Recipient Information</h3>
          <label>
            Recipient Name*
            <input
              name="recipientName"
              value={fields.recipientName}
              onChange={handleChange}
              placeholder="Full name of recipient"
            />
          </label>
        </div>

        {renderFields()}

        <div className="form-group">
          <h3>Additional Terms</h3>
          <label>
            Additional Terms & Conditions
            <textarea
              name="additionalTerms"
              value={fields.additionalTerms}
              onChange={handleChange}
              rows="4"
            />
          </label>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Generating..." : "Generate Document"}
        </button>
      </form>

      {error && <div className="error">{error}</div>}

      {contract && (
        <div className="generated-contract">
          <h3>Generated Document Preview:</h3>
          <pre>{contract}</pre>
          {documentUrl && (
            <button onClick={handleDownload} className="download-button">
              Download Document
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ContractForm;
