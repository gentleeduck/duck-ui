---
title: Alert Dialog Changelog
description: Updates and improvements to the Alert Dialog component.
---

## Changelog

### 2025-02-12 Simplified API, Improved State Handling & New Hook

We have **significantly improved** the AlertDialog API to make it more **predictable, modular, and type-safe**. The new approach focuses on reducing complexity, improving state handling, and enabling easy custom wrapper creation with a new **hook-based API**.

### 🫠 **Fixes & Improvements**

- **Refactored State Handling**: The previous implementation had issues where the dialog state didn't update correctly. This has been completely restructured for better control and predictability.
- **Consistent API for Variants**: We standardized how drawers, dialogs, and sheets handle their props, making them more aligned.
- **Enhanced Type Safety**: All components now utilize explicit **React types**, improving developer experience and reducing errors.
- **Improved Responsiveness**: The components now behave consistently across various screen sizes.
- **New Hook for Custom Wrappers**: The new `useDuckAlert` hook allows users to create **custom alert wrappers** with minimal effort.

### 🔄 **Updated API**

We **removed** `AlertDialogCustom` and introduced a simpler `AlertDialogWrapperProps` structure that relies on a new hook for **state management and component structuring**.

```diff showLineNumbers
- interface AlertDialogCustomProps<C> {
-   type: 'drawer' | 'dialog' | 'sheet'
-   state: C
-   header: AlertDialogDrawerHeaderType
-   footer: AlertDialogDrawerFooterType
-   trigger: AlertDialogDrawerTriggerentType
-   content: AlertDialogDrawerContentType
-   drawerData?: boolean
-   actions?: AlertDialogDrawerActionsType
- }
+ export interface AlertDialogWrapperProps {
+   alertTrigger: React.ComponentPropsWithoutRef<typeof AlertDialogTrigger>
+   alertContent: React.ComponentPropsWithoutRef<typeof AlertDialogContent> & {
+     _header?: React.ComponentPropsWithoutRef<typeof AlertDialogHeader> & {
+       _title?: React.ComponentPropsWithoutRef<typeof AlertDialogTitle>
+       _description?: React.ComponentPropsWithoutRef<typeof AlertDialogDescription>
+     }
+     _footer?: React.ComponentPropsWithoutRef<typeof AlertDialogFooter> & {
+       _cancel?: React.ComponentPropsWithoutRef<typeof AlertDialogCancel>
+       _submit?: React.ComponentPropsWithoutRef<typeof AlertDialogAction>
+     }
+   }
+   duckHook?: UseDuckAlertReturnType
+ }
```

### 📌 **Key Changes**

#### 1️⃣ **Removed `AlertDialogCustom` in Favor of Hook-Based API**

- Instead of a complex component with deeply nested props, we now **expose a hook (`useDuckAlert`)** that allows users to **manage state and structure alerts dynamically**.

#### 2️⃣ **New Hook: `useDuckAlert`**

The new hook simplifies **creating custom alert dialogs** without modifying the core API.

```tsx
// The state value change is the handler for the alert
const { alertTrigger, alertContent } = useDuckAlert({ state: true })
```

#### 3️⃣ **Better Prop Structure for Alert Components**

- Instead of passing multiple nested objects, we now pass a **flattened structure** with direct references to components.
- Users can now **easily override any section** of the alert (`header`, `footer`, `content`) using the new prop-based approach.

### 🚀 **What This Means for You**

- If you're currently using `AlertDialogCustom`, migrate to `useDuckAlert` for a more **scalable and flexible** API.
- The new **hook-based approach** enables you to create **custom wrappers effortlessly** without worrying about managing state manually.
- Better **autocompletion, type safety, and predictability** in state updates.


Here’s a polished version of the changelog section for the **alert dialog** updates:

---

### 2025-06-27 – Fixes & Improvements (Alert Dialog)

* Removed legacy dialog implementation.
* Migrated to the new native-based dialog system.
* Improved animation smoothness and reduced layout shifts.
* Refactored types and structure for better maintainability.
* Enhanced performance and accessibility.

---

