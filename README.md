# School Management & Portal System

A modern, responsive, and secure digital platform built for educational institutions to streamline administrative workflows, manage student and faculty records, and provide public-facing information and portals.

---

## 🌟 Key Features

* **Public Information Portal**:
  * **Dynamic Homepage**: Highlights institutional milestones, announcements, leadership messages, and quick lookup utilities.
  * **Directory & Pages**: Comprehensive sections for institutional background, faculty directories, academic calendars, and campus galleries.
  * **Communication**: Built-in contact channels, inquiry forms, and public notice boards.
* **Academic & Record Management**:
  * **Student & Class Directories**: Centralized administration of student profiles, roll numbers, session tracks, and class groupings.
  * **Faculty Management**: Staff directories detailing designations, qualifications, and specializations.
* **Admin Control Console**:
  * **Secure Authentication**: Role-based access control protecting sensitive administrative paths.
  * **System Oversight**: Real-time audit logging to monitor configuration changes and user activity.
  * **Infrastructure Management**: Cloud-backed storage buckets and relational database security configuration.

---

## 🛠️ Technology Stack

* **Frontend**: React 19, Vite, Tailwind CSS v4, TanStack React Query v5, Lucide React
* **Backend & Database (BaaS)**: Supabase (PostgreSQL, Row Level Security, Auth, and Storage Buckets replacing traditional custom backend and database servers)

---

## 📁 Architecture Overview

* **Database & Migration Layer**: Version-controlled idempotent SQL migrations handling schema definitions (`001`), RLS security policies (`002`), performance indexing (`003`), and storage rules (`005`).
* **Service & Routing Layer**: Decoupled service modules communicating with backend endpoints, protected by guarded route controllers and a global auth context.
* **Documentation**: Comprehensive manuals covering deployment strategies, administrative operations, system setup specifications, and project architecture.