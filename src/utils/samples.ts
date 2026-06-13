/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LibrarySample } from "../types";

export const SAMPLE_REQUIREMENTS: LibrarySample[] = [
  {
    id: "ecommerce-srs",
    title: "E-Commerce Microservices Orchestration",
    description: "Highly robust e-commerce microservice design with Orders, Inventory, and Payments. Outlines event dispatch patterns and ACID payment compliance.",
    techPreferences: {
      database: "PostgreSQL with Redis Cache",
      backend: "FastAPI with Celery",
      frontend: "Next.js (App Router)",
      cloudEnv: "Docker Compose with AWS ECS"
    },
    content: `# SOFTWARE REQUIREMENTS SPECIFICATION: NEXUS COMMERCE ENGINE

## 1. Project Overview & Scope
Nexus Commerce is a high-throughput, fault-tolerant B2C e-commerce platform designed to orchestrate ordering pipelines, inventory checking, and critical settlement webhooks. The system must process up to 10,000 orders per day with peak concurrent request spikes during promotional sales.

## 2. Functional Requirements
- **FR1 (User Auth)**: Bearer JWT based user login & registration. Persistent customer profiles with address books.
- **FR2 (Product Catalog)**: Searchable product catalog with categorizations, stock level limits, and multi-image galleries.
- **FR3 (Order Placement)**: Cart creation, multi-item order checkouts, coupon application, and tax calculations.
- **FR4 (Inventory Management)**: Optimistic locking on product quantities, inventory reservations valid for 15 minutes during order checkout, and auto-restocking alerts.
- **FR5 (Payment Gateway Proxy)**: Payment checkout via custom stripe gateway integration. Support webhook listeners for Charge.Succeeded and Charge.Failed.
- **FR6 (Transactional Emails)**: Multi-stage email confirmations (Order Received, Dispatched, Cancelled).

## 3. Non-Functional Requirements
- **Scalability**: Decouple product search requests from transactional writes via Read/Write database replicas or Elasticsearch proxies.
- **Resilience**: A payment gateway failure must not lose the active order draft. Orders should be held in a stateful queue (e.g., RabbitMQ or Redis List) for retry mechanisms.
- **Auditability**: Complete financial logs tracking raw transactional payment payloads for up to 7 years. All database tables must have auditing triggers (created_at, updated_at).
- **Latency**: P99 API response times under 150ms for page catalogs, and under 1 second for synchronized third-party checkout integrations.
`
  },
  {
    id: "collab-whiteboard",
    title: "Real-time Collaborative Whiteboard & Active Chat",
    description: "Websocket-centric specifications for an interactive digital whiteboard allowing group drawing, custom shapes, and synchronized chat rooms.",
    techPreferences: {
      database: "MongoDB with Redis PubSub",
      backend: "Express with Socket.io",
      frontend: "Vite React SPA",
      cloudEnv: "Kubernetes with GCP Ingress"
    },
    content: `# USER BRIEF & ARCHITECTURE TARGET: BOARDY CO-CALC

## 1. Introduction
Boardy is a zero-latency multiplayer collaboration hub. Users create virtual canvas spaces, invite peers via unique invite tokens, draw geometries (lines, circles, arrows) simultaneously, and chat via a persistent sidebar widget.

## 2. Core Functional Specifications
- **Real-time Canvas**: Canvas drawing actions must be distributed to all subscribed socket connections with less than 50ms propagation delay.
- **Workspace State Persistence**: Drawing edits and canvas shapes must be periodically snapshotted (auto-saved) to durable JSON storage to restore screens on rejoin.
- **Active Chat Rooms**: Private instant messaging inside active board sessions. Includes system messages when users join or exit the workspace.
- **Presence Indicators**: Visual mouse pointer tracking for active concurrent workspace users, indicating active names and coordinates in real-time.
- **Board Management**: Creating active workspaces, adding security passwords, exporting canvas snapshots to PNG, and inviting guest users.

## 3. Engineering Constraints & Operational Quality
- **High Concurrency**: Up to 2,000 concurrent active boards, with an average of 5 active collaborators per board.
- **Network Optimization**: Compress shape coordinates (deltas) into small payloads before wire transmission. Avoid sending full state redraws; instead, stream unified canvas path action events.
- **Security Check**: Validate auth tokens during socket handshake state before active subscription is authorized. Guest tokens must possess strictly read-only permissions unless the owner grants writing access.
`
  },
  {
    id: "dispatch-system",
    title: "On-Demand Ride Matching & Dispatch REST Layer",
    description: "Highly strict spatial location API specifications for active driver tracking, geospatial matching, ride state machines, and driver payout calculations.",
    techPreferences: {
      database: "PostgreSQL (PostGIS) with Redis Geospatial",
      backend: "Python FastAPI with WebSockets",
      frontend: "React Native with Mapbox",
      cloudEnv: "Google Cloud Run with GCP Cloud SQL"
    },
    content: `# PRODUCT REQUIREMENTS DOCUMENT (PRD): VELOCE RIDES

## 1. System Vision
Veloce Rides is an on-demand taxi routing, dispatching, and matching system that couples geographic coordinates from drivers and riders to find the optimal fare dispatch list under 5 seconds.

## 2. Detailed Technical Requirements
- **DR1 (Geospatial Location Updates)**: Driver app submits current latitude & longitude every 5 seconds. Location stream must populate Redis Geospatial indexing for lightning-fast radial lookups.
- **DR2 (On-Demand Dispatch Logic)**: When a rider requests a pickup:
  - Query drivers within a 3-mile radius sorted by proximity.
  - Deliver dispatch invites sequentially to drivers via low-latency push socket messages.
  - Driver has exactly 15 seconds to accept before the server locks the driver state and triggers an invite to the next closest driver.
- **DR3 (Ride State Transitions)**: Standard lifecycle with constraints: Custom state machine: Draft -> Searching -> Accepted -> DriverArrived -> InProgress -> Completed. Avoid illegal jumps (e.g. from Accepted directly to Completed).
- **DR4 (Billing & Payout)**: Record ride distance, duration, surcharge factors (rush hours, active rain triggers), calculate total billing, charge customer token via stripe, credit driver account.
- **DR5 (Dynamic Surcharging)**: Auto-escalate standard base fares if current rider requests exceed active location's available drivers by 120%.

## 3. High Availability Specifications
- **Location Stream Ingestion**: The API gateway must ingest up to 5,000 GPS submissions per second without blocking matching engines. Use asynchronous workers for persistent database archiving.
- **Database PostGIS**: Use geospatial indexes (GIST) for calculating distances on permanent tables.
- **Fault Recovery**: If matching queue database falls offline, active live rides in-progress must recover safely using buffered redis sessions.
`
  }
];
