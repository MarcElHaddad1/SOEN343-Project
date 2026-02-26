# Smart Urban Mobility Management System (SUMMS)

## Phase II – System Architecture, Use Cases, and Sequence Diagram  
**Course:** SOEN 343 – Software Architecture  
**Date:** February 2026  
**Team:** PROJ343Soen

---

## Overview
The **Smart Urban Mobility Management System (SUMMS)** is a unified platform designed to integrate and manage multiple urban mobility services within a single system.  
SUMMS enables users to search for shared vehicles, reserve rentals, complete payments, and return vehicles, while providing administrators and mobility providers with tools for vehicle management and analytics.

This phase of the project focuses on **system architecture design**, **use case definition**, and **interaction modeling** to ensure scalability, maintainability, and extensibility as the system evolves.

---

## Table of Contents
1. [System Architecture](#system-architecture)
   - [Selected Architecture](#selected-architecture-layered-architecture)
   - [Architectural Qualities](#architectural-qualities)
   - [Alternative Architecture Comparison](#alternative-architecture-comparison)
2. [Use Cases](#use-cases)
   - [Use Case Scenarios](#use-case-scenarios)
3. [Sequence Diagram](#sequence-diagram)
4. [Team Members & Roles](#team-members--roles)

---

## System Architecture

### Selected Architecture: Layered Architecture
SUMMS adopts a **Layered Architecture** to support the integration of multiple urban mobility services within a single unified platform.  
This architectural style was selected to handle the evolving nature of urban mobility systems and the continuous integration of external providers.

The system is structured into the following layers:

#### Presentation Layer
Provides the user-facing **web and mobile interfaces** developed using **React**.  
It includes:
- Customer dashboards for vehicle search, trip planning, reservations, payments, and returns
- Administrative dashboards for monitoring system activity and analytics

#### Application / API Layer
Implemented using **Node.js and Express**, this layer:
- Exposes RESTful APIs
- Handles authentication and authorization
- Validates incoming requests
- Coordinates interactions between the UI and domain services

#### Service / Domain Layer
Contains the core business logic, including:
- Vehicle search and reservation
- Trip planning
- Rental lifecycle management
- Pricing rules
- Analytics computation

#### Data Layer
Manages system persistence using **MySQL**, storing:
- Users
- Vehicles
- Reservations
- Transactions
- Analytics records

#### Integration / Adapters Layer
Interfaces with external systems such as:
- Public transportation feeds
- Parking systems
- Shared mobility providers
- Mapping services
- Payment and notification services

This layer isolates external dependencies, allowing providers to be replaced or extended without impacting the core system.

---

### Architectural Qualities

**Maintainability**  
The layered architecture isolates responsibilities, allowing changes to be made in one layer without affecting others. This is essential for a system expected to continuously evolve.

**Performance**  
High-frequency operations such as vehicle search, route planning, and availability checks are efficiently handled. Performance optimizations can be applied at the service or data layers independently.

**Security**  
Security concerns are centralized in the API layer through authentication, authorization, and input validation. Sensitive data such as user information and payment-related data is protected through controlled access and secure communication.

---

### Alternative Architecture Comparison

**Selected Architecture: Layered Architecture**  
- Clear separation of concerns  
- Easier testing and maintenance  
- Centralized security enforcement  

**Alternative Architecture: Client–Server Architecture**  
- Simpler initial implementation  
- Becomes difficult to maintain as system complexity grows  
- Business logic risks being tightly coupled with routing and UI logic  

**Conclusion**  
The layered architecture better fits SUMMS due to its long-term scalability, integration needs, and evolving functionality.

---

## Use Cases

### Use Case Scenarios

#### UC-01: Register / Login
**Primary Actor:** Customer (User)

**Description:**  
Allows users to register or authenticate into the SUMMS platform to access mobility services.

**Preconditions**
- User has access to the application
- System is operational

**Postconditions**
- User is authenticated
- Active session is created

**Main Success Scenario**
1. User opens the SUMMS application  
2. User selects Register or Login  
3. User enters credentials or registration details  
4. System validates information  
5. User is authenticated  
6. Session is created  
7. User gains platform access  

---

#### UC-02: Search Available Vehicles
**Primary Actor:** Customer (User)

**Description:**  
User searches for vehicles by city, type, price range, and availability window.

**Preconditions**
- User is logged in  
- Vehicle inventory exists  

**Postconditions**
- Matching vehicles are displayed  

**Main Success Scenario**
1. User opens vehicle search  
2. System displays filters  
3. User enters criteria  
4. System queries availability and pricing  
5. Matching vehicles are displayed  

---

#### UC-03: Reserve Vehicle
**Primary Actor:** Customer (User)

**Description:**  
User reserves a selected vehicle for a specified time window.

**Preconditions**
- User is authenticated  
- Vehicle is available  

**Postconditions**
- Reservation record is created  
- Vehicle status is updated to “Reserved”  

**Main Success Scenario**
1. User searches vehicles  
2. User selects a vehicle  
3. System verifies availability  
4. Reservation is created  
5. Vehicle status is updated  
6. Confirmation is displayed  

---

#### UC-04: Pay for Rental
**Primary Actor:** Customer (User)

**Description:**  
Completes rental and processes payment.

**Preconditions**
- Rental is active  
- Payment method exists  

**Postconditions**
- Rental is closed  
- Payment and receipt are recorded  

**Main Success Scenario**
1. User selects “End Rental”  
2. System confirms return conditions  
3. System calculates charges  
4. Payment service processes payment  
5. Rental is closed  
6. Receipt is displayed  

---

#### UC-05: Return Vehicle
**Primary Actor:** Customer (User)

**Description:**  
Allows the user to return a rented vehicle.

**Preconditions**
- User is authenticated  
- Active rental exists  

**Postconditions**
- Rental is completed  
- Vehicle status is updated to “Available”  

**Main Success Scenario**
1. User selects return option  
2. System verifies rental  
3. Rental status is updated  
4. Vehicle status is updated  
5. Confirmation is shown  

---

#### UC-06: Manage Vehicles
**Primary Actor:** Mobility Provider

**Description:**  
Allows providers to add or update vehicle information.

**Preconditions**
- Provider is authenticated  

**Postconditions**
- Vehicle records are updated  

**Main Success Scenario**
1. Provider logs in  
2. Selects manage vehicles  
3. Enters or updates vehicle details  
4. System validates data  
5. Data is saved  
6. Confirmation is displayed  

---

#### UC-07: View Analytics
**Primary Actor:** Admin

**Description:**  
Admin views gateway-level analytics across services.

**Preconditions**
- Admin is authenticated  
- Analytics data exists  

**Postconditions**
- Dashboard is displayed  

**Main Success Scenario**
1. Admin opens analytics dashboard  
2. Selects filters  
3. System aggregates data  
4. Metrics are displayed  

---

## Sequence Diagram
Sequence diagrams illustrate interactions between users, the presentation layer, API layer, service layer, data layer, and external systems for key use cases such as reservation, payment, and vehicle return.

---

## Team Members & Roles

- **Ahmad Al Habbal (40261029)**  
  *Team Leader, Testing & Frontend Developer*

- **Karim Mikhaeil (40233685)**  
  *Full-Stack Developer*

- **Mena Boulus (40291619)**  
  *Full-Stack Developer*

- **Marc El Haddad (40231208)**  
  *Backend Developer & Documentation Lead*

- **Abd Al Rahman Al Kabani (40247395)**  
  *Full-Stack Developer*

- **Harjot Minhas (40315397)**  
  *Testing & Full-Stack Developer*

---

## License
This project is developed strictly for academic purposes as part of **SOEN 343 – Software Architecture**.
