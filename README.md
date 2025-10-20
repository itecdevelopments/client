# React + Vite

## 👥 Demo User Accounts

Use these preconfigured accounts to log in and test role-based access and region scoping.

---

### 🧑‍🔧 Engineers (ENG)

| Name            | Username  | Password   | Region       | Region ID                  |
| --------------- | --------- | ---------- | ------------ | -------------------------- |
| Engineer Riyadh | `eng_ryd` | `test1234` | RYD (Riyadh) | `68e6c8354e58006aca2feb6b` |
| Engineer Jeddah | `eng_jed` | `test1234` | JED (Jeddah) | `68e6c8424e58006aca2feb6d` |
| Engineer Dammam | `eng_dmm` | `test1234` | DMM (Dammam) | `68e6c8234e58006aca2feb69` |

---

### 🧑‍💼 Branch Managers (BM)

| Name                  | Username | Password   | Region       | Region ID                  |
| --------------------- | -------- | ---------- | ------------ | -------------------------- |
| Branch Manager Riyadh | `bm_ryd` | `test1234` | RYD (Riyadh) | `68e6c8354e58006aca2feb6b` |
| Branch Manager Jeddah | `bm_jed` | `test1234` | JED (Jeddah) | `68e6c8424e58006aca2feb6d` |
| Branch Manager Dammam | `bm_dmm` | `test1234` | DMM (Dammam) | `68e6c8234e58006aca2feb69` |

---

### 🧑‍🏫 Country Manager (CM)

| Name                    | Username     | Password   | Region       | Region ID                  |
| ----------------------- | ------------ | ---------- | ------------ | -------------------------- |
| Country Manager General | `cm_general` | `test1234` | DMM (Dammam) | `68e6c8234e58006aca2feb69` |

---

### 🧑‍💻 Admin (VXR)

| Name              | Username    | Password    | Region       | Region ID                  |
| ----------------- | ----------- | ----------- | ------------ | -------------------------- |
| Admin (Superuser) | `admin_vxr` | `admin1234` | DMM (Dammam) | `68e6c8234e58006aca2feb69` |

---

### 🔎 Summary

- 👷‍♂️ **3 Engineers (ENG)**
- 🧑‍💼 **3 Branch Managers (BM)**
- 🧑‍🏫 **1 Country Manager (CM)**
- 🛠️ **1 Admin (VXR)**

> **Note:** These accounts are for development/testing. Roles control what sections of the dashboard are visible (e.g., ENG/BM can create & view service reports; VXR has full access).


POST
http://localhost:3000/api/v1/reports

BODY :
{
"SerialReportNumber": "reportSerialNumber",
"Date": "2025-10-14",
"Customer": "68e986601503cdc515dc6026",
"timeIn": "21:19",
"timeOut": "21:17",
"Quotation": "dsfsfsffsfsfsfs",
"PurchaseOrder": "daasdadasdad",
"Inventory": "Testing",
"MachineType": "LASER",
"Model": "asdsadasdasdsa",
"SerialNumber": "asdasdadadas",
"ServiceType": "DEMO",
"ServiceDueDate": null,
"description": "Nothing Done Just Testing",
"JobCompleted": "yes",
"region": "68e6c8234e58006aca2feb69",
"engineerName": "68eb764306778946d20af81e",
"spare": [
"68ec998d6282079a6c635c4d",
"68ec998d6282079a6c635c4e",
"68ec998d6282079a6c635c4f"
],
"customerPhoneNumber": "0552323323",
"customerdesignation": "Manager",
"concernName": "Mohammed",
"serviceReportPicture": "https://res.cloudinary.com/dvjy4chp6/image/upload/v1760368941/yjok0cdsvo0itpykwwfl.jpg",
"deliveryNotePicture": "https://res.cloudinary.com/dvjy4chp6/image/upload/v1760368941/yjok0cdsvo0itpykwwfl.jpg"
}
"# client" 
