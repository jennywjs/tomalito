# Product Requirements Document (PRD)
**Version:** v1.3  
**Author:** [Your Name]  
**Date:** [Today’s Date]  
**Stakeholders:** You (product owner), developer/designer  

---

## 1. Overview

**Purpose:**  
To create a warm online space to share updates about “Tomalito” (or “小番茄”) with friends and family, replacing constant individual inquiries with one simple, joyful platform.  

**Goal:**  
- **Today-only build** (“vibe coding” — launch in 1 day).  
- Blog as the homepage for quick updates.  
- Well Wishes page for messages from visitors.  
- Prominent animated banner with title and subtitle.  

---

## 2. Final Website Name & Header Design

**Title:**  
> Hello World, Tomalito  

**Subtitle:**  
> Sharing the latest of Tomalito  

**Banner:**  
- Animated cute baby tomato (cartoon style) blinking and waving in the sky (looped animation).  
- Title + subtitle overlaid or positioned just beneath the animation.  

---

## 3. Scope

**In Scope:**  
- Blog (homepage) with post list & “add post” form.  
- Well Wishes page with message form & display.  
- Responsive design for desktop and mobile.  
- Animated banner on every page.  

**Out of Scope:**  
- User accounts & logins.  
- Social sharing, comments, likes.  
- Language toggle and automatic translation.  

---

## 4. User Stories
1. As a mom-to-be, I want to post updates in one place so I don’t have to answer the same questions repeatedly.  
2. As a visitor, I want to easily leave a message for the baby.  

---

## 5. Functional Requirements

**Blog Page (Homepage):**  
- Banner (animation, title, subtitle).  
- List of posts: title, date, author, content, optional photo.  
- “Add Post” form (title, content, photo, author name).  

**Well Wishes Page:**  
- Message form: Name, Message, Submit.  
- Display list of messages with name and timestamp.  

---

## 6. Non-Functional Requirements
- Mobile-first responsive design.  
- Load time under 3 seconds.  
- Lightweight animation optimized for mobile.  
- Minimalistic, calming UI to reduce stress.  

---

## 7. Tech Stack

**Front-End:**  
- Next.js  
- Tailwind CSS  
- Framer Motion or Lottie (for animation)  

**Back-End:**  
- Node.js + Express  
- MongoDB Atlas (posts & wishes)  

**Hosting & Media:**  
- Vercel (front-end & API hosting)  
- Cloudinary (images & animation storage)  

---

## 8. Risks & Assumptions
- Animation must be compressed to avoid slowing page load.  

---

## 9. Timeline
- **Today** (full build & deploy):  
  1. Morning — Setup environment, basic layout  
  2. Midday — Blog & Well Wishes features  
  3. Afternoon — Animation banner  
  4. Evening — Testing & deploy 