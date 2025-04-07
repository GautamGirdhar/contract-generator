const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const PDFDocument = require('pdfkit');
const fs = require("fs");
const path = require("path");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Serve static files from uploads directory
app.use("/uploads", express.static(uploadsDir));

app.use(express.static("public"));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

const getContractPrompt = (type, fields) => {
  switch (type) {
    case "Rental Contract":
      return `Generate a professional Rental Agreement. Use the following information:

Owner Details:
- Name: ${fields.ownerName}
- Address: ${fields.ownerAddress}

Tenant Details:
- Name: ${fields.recipientName}

Property Details:
- Property Address: ${fields.propertyAddress}
- Monthly Rent: ${fields.rentAmount}
- Lease Duration: ${fields.duration}
${fields.securityDeposit ? `- Security Deposit: ${fields.securityDeposit}` : ""}
${fields.utilities ? `- Utilities Included: ${fields.utilities}` : ""}
${
  fields.additionalTerms ? `\nAdditional Terms:\n${fields.additionalTerms}` : ""
}

Please format this as a comprehensive rental agreement that includes:
1. Property description and permitted use
2. Rent payment terms and due dates
3. Security deposit details and conditions
4. Utilities and maintenance responsibilities
5. Tenant and landlord obligations
6. Terms for lease termination and renewal
7. Standard legal clauses for property rental
8. Signature blocks with the following format:

**Owner:**
Name: ${fields.ownerName}
Signature: [OWNER_SIGNATURE]
Date: [Date]

**Tenant:**
Name: ${fields.recipientName}
Signature: [TENANT_SIGNATURE]
Date: [Date]

**Witness (Optional):**
Name:
Signature:
Date:

Format the document to include:
- Date and place at the top
- Clear section headings
- Numbered clauses

Make it legally thorough while being clear and understandable.`;

    case "Freelance Contract":
      return `Generate a professional Freelance Service Agreement. Use the following information:

Company Details:
- Name: ${fields.companyName}
${fields.companyAddress ? `- Address: ${fields.companyAddress}` : ""}

Recipient Details:
- Name: ${fields.recipientName}

Project Details:
- Project Scope: ${fields.projectScope}
- Deliverables: ${fields.deliverables}
- Payment Terms: ${fields.paymentTerms}
${fields.revisions ? `- Revision Policy: ${fields.revisions}` : ""}
${
  fields.additionalTerms ? `\nAdditional Terms:\n${fields.additionalTerms}` : ""
}

Please format this as a comprehensive freelance contract that includes:
1. Detailed project scope and deliverables
2. Timeline and milestones
3. Payment terms and conditions
4. Intellectual property rights
5. Revision and feedback process
6. Termination clauses
7. Confidentiality agreement
8. Independent contractor status
9. Signature blocks

Ensure it protects both parties while being clear about expectations and deliverables.`;

    default: // Offer Letter & Employment Contract
      return `Generate a professional ${type}. Use the following information:

Company Details:
- Name: ${fields.companyName}
${fields.companyAddress ? `- Address: ${fields.companyAddress}` : ""}

Recipient Details:
- Name: ${fields.recipientName}

Employment Details:
- Position: ${fields.position}
${fields.location ? `- Location: ${fields.location}` : ""}
- Start Date: ${fields.startDate}
${fields.duration ? `- Duration: ${fields.duration}` : ""}
${fields.workingDays ? `- Working Days: ${fields.workingDays}` : ""}
- Working Hours: ${fields.workingHours}

Compensation & Benefits:
- Compensation: ${fields.compensation}
${fields.benefits ? `- Benefits:\n${fields.benefits}` : ""}
${
  fields.additionalTerms ? `\nAdditional Terms:\n${fields.additionalTerms}` : ""
}

Please format this as a professional business letter that includes:
1. Company letterhead
2. Current date
3. Recipient's name and address
4. Formal salutation
5. Job description and responsibilities
6. Compensation and benefits details
7. Employment terms and conditions
8. Confidentiality and non-compete clauses
9. Signature blocks

Format the document with placeholders for:
- [LOGO_IMAGE] at the top of the document in the letterhead
- [SIGNATURE_IMAGE] at the bottom near the authorized signatory block

Make it welcoming yet professional, clearly outlining all terms of employment.`;
  }
};

const createPdfFromContract = async (contract, fields, type) => {
  // Process placeholders before generating the document
  // Replace signature placeholders
  contract = contract.replace(/\[OWNER_SIGNATURE\]/g, "");
  contract = contract.replace(/\[TENANT_SIGNATURE\]/g, "");
  contract = contract.replace(/\[SIGNATURE_IMAGE\]/g, "");

  // Replace date placeholders with current date
  const currentDate = new Date().toLocaleDateString();
  contract = contract.replace(/\[Date\]/g, currentDate);

  // Create a new PDF document
  const doc = new PDFDocument();
  const fileName = `${type.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.pdf`;
  const filePath = path.join(uploadsDir, fileName);
  const writeStream = fs.createWriteStream(filePath);

  // Pipe the PDF to the file
  doc.pipe(writeStream);

  // Add logo if provided
  if (fields.logoImage) {
    const imageData = fields.logoImage.split(',')[1];
    const imageBuffer = Buffer.from(imageData, 'base64');
    doc.image(imageBuffer, {
      fit: [200, 100],
      align: 'center'
    });
    doc.moveDown();
  }

  // Add contract content
  const lines = contract.split('\n');
  for (const line of lines) {
    if (line.trim()) {
      const isHeading = line.startsWith('#') || /^[A-Z\s]+:/.test(line) || line.includes('**');
      if (isHeading) {
        doc.fontSize(16)
           .font('Helvetica-Bold')
           .text(line.replace(/^#\s*/, '').replace(/\*\*/g, ''), {
             align: 'center'
           });
      } else {
        doc.fontSize(12)
           .font('Helvetica')
           .text(line);
      }
      doc.moveDown(0.5);
    }
  }

  // Add signatures section
  doc.moveDown(2);
  doc.fontSize(16)
     .font('Helvetica-Bold')
     .text('Signatures:', { align: 'center' });
  doc.moveDown();

  if (type === 'Rental Contract') {
    // Create signature section
    const startY = doc.y;
    const pageWidth = doc.page.width - 100; // Margins
    const colWidth = pageWidth / 2;

    // Owner signature
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text("Owner's Signature", 50, startY, { width: colWidth, align: 'center' });

    // Tenant signature
    doc.text("Tenant's Signature", 50 + colWidth, startY, { width: colWidth, align: 'center' });

    // Add signatures if provided
    if (fields.ownerSignature) {
      const ownerSigData = fields.ownerSignature.split(',')[1];
      const ownerSigBuffer = Buffer.from(ownerSigData, 'base64');
      doc.image(ownerSigBuffer, 75, startY + 20, { fit: [150, 75] });
    }

    if (fields.tenantSignature) {
      const tenantSigData = fields.tenantSignature.split(',')[1];
      const tenantSigBuffer = Buffer.from(tenantSigData, 'base64');
      doc.image(tenantSigBuffer, 75 + colWidth, startY + 20, { fit: [150, 75] });
    }

    // Add names
    doc.fontSize(12)
       .font('Helvetica')
       .text(fields.ownerName, 50, startY + 100, { width: colWidth, align: 'center' })
       .text(fields.recipientName, 50 + colWidth, startY + 100, { width: colWidth, align: 'center' });

    // Add dates
    doc.text(currentDate, 50, startY + 120, { width: colWidth, align: 'center' })
       .text(currentDate, 50 + colWidth, startY + 120, { width: colWidth, align: 'center' });

    // Add witness section
    doc.moveDown(4)
       .fontSize(14)
       .font('Helvetica-Bold')
       .text('Witness (Optional):', { align: 'center' })
       .moveDown()
       .fontSize(12)
       .font('Helvetica')
       .text('Name: ____________________', { align: 'center' })
       .moveDown()
       .text('Signature: ____________________', { align: 'center' })
       .moveDown()
       .text('Date: ____________________', { align: 'center' });

  } else {
    // Company signature
    if (fields.signatureImage) {
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('Authorized Signatory:', { align: 'center' });

      const sigData = fields.signatureImage.split(',')[1];
      const sigBuffer = Buffer.from(sigData, 'base64');
      doc.image(sigBuffer, { fit: [200, 100], align: 'center' });

      doc.fontSize(12)
         .font('Helvetica')
         .text(fields.companyName, { align: 'center' })
         .moveDown()
         .text(`Date: ${currentDate}`, { align: 'center' });
    }
  }

  // Finalize the PDF
  doc.end();

  // Wait for the file to be written
  await new Promise((resolve, reject) => {
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  });

  // Return the file URL for download
  return { fileName, fileUrl: `/uploads/${fileName}` };
};

app.post("/generate-contract", async (req, res) => {
  const { type, fields } = req.body;

  try {
    const prompt = getContractPrompt(type, fields);
    const result = await geminiModel.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.8,
        maxOutputTokens: 2048,
      },
    });

    const response = await result.response;
    const contract = response.text();

    // Generate PDF file
    const docInfo = await createPdfFromContract(contract, fields, type);

    // Return the contract text and file URL
    res.json({
      contract,
      fileUrl: docInfo.fileUrl,
    });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "Failed to generate document: " + error.message });
  }
});

app.listen(5000, () =>
  console.log("✅ Server running on http://localhost:5000")
);
