PS C:\Users\junio\sih> npx tsc --noEmit
components/admin/audit-log-viewer.tsx:94:9 - error TS2698: Spread types may only be created from object types.

94         ...log,
           ~~~~~~

components/admin/audit-log-viewer.tsx:95:25 - error TS2339: Property 'user' does not exist on type 'ParserError<"Unable to parse renamed field at `user:auth.users!user_id(email)\n        `">'.

95         user_email: log.user?.email || 'Utilisateur inconnu',
                           ~~~~

components/admin/staff-management.tsx:133:16 - error TS2345: Argument of type '{ id: any; email: any; created_at: any; profile: { id: any; role: any; specialty: any; phone_work: any; }; centres: Centre[]; }[]' is not assignable to parameter of type 'SetStateAction<UserWithProfile[]>'.     
  Type '{ id: any; email: any; created_at: any; profile: { id: any; role: any; specialty: any; phone_work: any; }; centres: Centre[]; }[]' is not assignable to type 'UserWithProfile[]'.
    Type '{ id: any; email: any; created_at: any; profile: { id: any; role: any; specialty: any; phone_work: any; }; centres: Centre[]; }' is not assignable to type 'UserWithProfile'.
      Types of property 'profile' are incompatible.
        Property 'email' is missing in type '{ id: any; role: any; specialty: any; phone_work: any; }' but required in type 'Profile'.

133       setStaff(staffWithDetails);
                   ~~~~~~~~~~~~~~~~

  components/admin/staff-management.tsx:24:3
    24   email: string;
         ~~~~~
    'email' is declared here.

components/Hospital Management System Template/src/components/DashboardView.tsx:3:136 - error TS2307: Cannot find module 'recharts' or its corresponding type declarations.

3 import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
                                                                                                                                         ~~~~~~~~~~

components/Hospital Management System Template/src/components/DashboardView.tsx:109:29 - error TS7031: Binding element 'name' implicitly has an 'any' type.

109                   label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                ~~~~

components/Hospital Management System Template/src/components/DashboardView.tsx:109:35 - error TS7031: Binding element 'percent' implicitly has an 'any' type.

109                   label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                      ~~~~~~~

components/Hospital Management System Template/src/components/ui/accordion.tsx:4:37 - error TS2307: Cannot find module '@radix-ui/react-accordion@1.2.3' or its corresponding type declarations.

4 import * as AccordionPrimitive from "@radix-ui/react-accordion@1.2.3";
                                      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/accordion.tsx:5:33 - error TS2307: Cannot find module 'lucide-react@0.487.0' or its corresponding type declarations.

5 import { ChevronDownIcon } from "lucide-react@0.487.0";
                                  ~~~~~~~~~~~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/alert-dialog.tsx:4:39 - error TS2307: Cannot find module '@radix-ui/react-alert-dialog@1.1.6' or its corresponding type declarations.

4 import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog@1.1.6";
                                        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/alert.tsx:2:40 - error TS2307: Cannot find module 'class-variance-authority@0.7.1' or its corresponding type declarations.

2 import { cva, type VariantProps } from "class-variance-authority@0.7.1";
                                         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/aspect-ratio.tsx:3:39 - error TS2307: Cannot find module '@radix-ui/react-aspect-ratio@1.1.2' or its corresponding type declarations.

3 import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio@1.1.2";
                                        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/avatar.tsx:4:34 - error TS2307: Cannot find module '@radix-ui/react-avatar@1.1.3' or its corresponding type declarations.

4 import * as AvatarPrimitive from "@radix-ui/react-avatar@1.1.3";
                                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/badge.tsx:2:22 - error TS2307: Cannot find module '@radix-ui/react-slot@1.1.2' or its corresponding type declarations.

2 import { Slot } from "@radix-ui/react-slot@1.1.2";
                       ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/badge.tsx:3:40 - error TS2307: Cannot find module 'class-variance-authority@0.7.1' or its corresponding type declarations.

3 import { cva, type VariantProps } from "class-variance-authority@0.7.1";
                                         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/breadcrumb.tsx:2:22 - error TS2307: Cannot find module '@radix-ui/react-slot@1.1.2' or its corresponding type declarations.

2 import { Slot } from "@radix-ui/react-slot@1.1.2";
                       ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/breadcrumb.tsx:3:46 - error TS2307: Cannot find module 'lucide-react@0.487.0' or its corresponding type declarations.

3 import { ChevronRight, MoreHorizontal } from "lucide-react@0.487.0";
                                               ~~~~~~~~~~~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/button.tsx:2:22 - error TS2307: Cannot find module '@radix-ui/react-slot@1.1.2' or its corresponding type declarations.

2 import { Slot } from "@radix-ui/react-slot@1.1.2";
                       ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/button.tsx:3:40 - error TS2307: Cannot find module 'class-variance-authority@0.7.1' or its corresponding type declarations.

3 import { cva, type VariantProps } from "class-variance-authority@0.7.1";
                                         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/calendar.tsx:4:43 - error TS2307: Cannot find module 'lucide-react@0.487.0' or its corresponding type declarations.

4 import { ChevronLeft, ChevronRight } from "lucide-react@0.487.0";
                                            ~~~~~~~~~~~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/calendar.tsx:5:27 - error TS2307: Cannot find module 'react-day-picker@8.10.1' or its corresponding type declarations.

5 import { DayPicker } from "react-day-picker@8.10.1";
                            ~~~~~~~~~~~~~~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/calendar.tsx:63:22 - error TS7031: Binding element 'className' implicitly has an 'any' type.

63         IconLeft: ({ className, ...props }) => (
                        ~~~~~~~~~

components/Hospital Management System Template/src/components/ui/calendar.tsx:66:23 - error TS7031: Binding element 'className' implicitly has an 'any' type.

66         IconRight: ({ className, ...props }) => (
                         ~~~~~~~~~

components/Hospital Management System Template/src/components/ui/carousel.tsx:6:8 - error TS2307: Cannot find module 'embla-carousel-react@8.6.0' or its corresponding type declarations.

6 } from "embla-carousel-react@8.6.0";
         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/carousel.tsx:7:39 - error TS2307: Cannot find module 'lucide-react@0.487.0' or its corresponding type declarations.

7 import { ArrowLeft, ArrowRight } from "lucide-react@0.487.0";
                                        ~~~~~~~~~~~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/chart.tsx:4:36 - error TS2307: Cannot find module 'recharts@2.15.2' or its corresponding type declarations.

4 import * as RechartsPrimitive from "recharts@2.15.2";
                                     ~~~~~~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/chart.tsx:182:23 - error TS7006: Parameter 'item' implicitly has an 'any' type. 

182         {payload.map((item, index) => {
                          ~~~~

components/Hospital Management System Template/src/components/ui/chart.tsx:182:29 - error TS7006: Parameter 'index' implicitly has an 'any' type.

182         {payload.map((item, index) => {
                                ~~~~~

components/Hospital Management System Template/src/components/ui/chart.tsx:278:21 - error TS7006: Parameter 'item' implicitly has an 'any' type. 

278       {payload.map((item) => {
                        ~~~~

components/Hospital Management System Template/src/components/ui/checkbox.tsx:4:36 - error TS2307: Cannot find module '@radix-ui/react-checkbox@1.1.4' or its corresponding type declarations.

4 import * as CheckboxPrimitive from "@radix-ui/react-checkbox@1.1.4";
                                     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/checkbox.tsx:5:27 - error TS2307: Cannot find module 'lucide-react@0.487.0' or its corresponding type declarations.

5 import { CheckIcon } from "lucide-react@0.487.0";
                            ~~~~~~~~~~~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/collapsible.tsx:3:39 - error TS2307: Cannot find module '@radix-ui/react-collapsible@1.1.3' or its corresponding type declarations.

3 import * as CollapsiblePrimitive from "@radix-ui/react-collapsible@1.1.3";
                                        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/command.tsx:4:45 - error TS2307: Cannot find module 'cmdk@1.1.1' or its corresponding type declarations.

4 import { Command as CommandPrimitive } from "cmdk@1.1.1";
                                              ~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/command.tsx:5:28 - error TS2307: Cannot find module 'lucide-react@0.487.0' or its corresponding type declarations.

5 import { SearchIcon } from "lucide-react@0.487.0";
                             ~~~~~~~~~~~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/context-menu.tsx:4:39 - error TS2307: Cannot find module '@radix-ui/react-context-menu@2.2.6' or its corresponding type declarations.

4 import * as ContextMenuPrimitive from "@radix-ui/react-context-menu@2.2.6";
                                        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/context-menu.tsx:5:57 - error TS2307: Cannot find module 'lucide-react@0.487.0' or its corresponding type declarations.

5 import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react@0.487.0";
                                                          ~~~~~~~~~~~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/dialog.tsx:4:34 - error TS2307: Cannot find module '@radix-ui/react-dialog@1.1.6' or its corresponding type declarations.

4 import * as DialogPrimitive from "@radix-ui/react-dialog@1.1.6";
                                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/dialog.tsx:5:23 - error TS2307: Cannot find module 'lucide-react@0.487.0' or its corresponding type declarations.

5 import { XIcon } from "lucide-react@0.487.0";
                        ~~~~~~~~~~~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/drawer.tsx:4:43 - error TS2307: Cannot find module 'vaul@1.1.2' or its corresponding type declarations.

4 import { Drawer as DrawerPrimitive } from "vaul@1.1.2";
                                            ~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/dropdown-menu.tsx:4:40 - error TS2307: Cannot find module '@radix-ui/react-dropdown-menu@2.1.6' or its corresponding type declarations.

4 import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu@2.1.6";
                                         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/dropdown-menu.tsx:5:57 - error TS2307: Cannot find module 'lucide-react@0.487.0' or its corresponding type declarations.

5 import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react@0.487.0";
                                                          ~~~~~~~~~~~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/form.tsx:4:33 - error TS2307: Cannot find module '@radix-ui/react-label@2.1.2' or its corresponding type declarations.

4 import * as LabelPrimitive from "@radix-ui/react-label@2.1.2";
                                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/form.tsx:5:22 - error TS2307: Cannot find module '@radix-ui/react-slot@1.1.2' or its corresponding type declarations.

5 import { Slot } from "@radix-ui/react-slot@1.1.2";
                       ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/form.tsx:14:8 - error TS2307: Cannot find module 'react-hook-form@7.55.0' or its corresponding type declarations.

14 } from "react-hook-form@7.55.0";
          ~~~~~~~~~~~~~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/hover-card.tsx:4:37 - error TS2307: Cannot find module '@radix-ui/react-hover-card@1.1.6' or its corresponding type declarations.

4 import * as HoverCardPrimitive from "@radix-ui/react-hover-card@1.1.6";
                                      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/input-otp.tsx:4:43 - error TS2307: Cannot find module 'input-otp@1.4.2' or its corresponding type declarations.

4 import { OTPInput, OTPInputContext } from "input-otp@1.4.2";
                                            ~~~~~~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/input-otp.tsx:5:27 - error TS2307: Cannot find module 'lucide-react@0.487.0' or its corresponding type declarations.

5 import { MinusIcon } from "lucide-react@0.487.0";
                            ~~~~~~~~~~~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/input-otp.tsx:47:61 - error TS2339: Property 'slots' does not exist on type '{}'.

47   const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};
                                                               ~~~~~

components/Hospital Management System Template/src/components/ui/label.tsx:4:33 - error TS2307: Cannot find module '@radix-ui/react-label@2.1.2' or its corresponding type declarations.

4 import * as LabelPrimitive from "@radix-ui/react-label@2.1.2";
                                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/menubar.tsx:4:35 - error TS2307: Cannot find module '@radix-ui/react-menubar@1.1.6' or its corresponding type declarations.

4 import * as MenubarPrimitive from "@radix-ui/react-menubar@1.1.6";
                                    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/menubar.tsx:5:57 - error TS2307: Cannot find module 'lucide-react@0.487.0' or its corresponding type declarations.

5 import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react@0.487.0";
                                                          ~~~~~~~~~~~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/navigation-menu.tsx:2:42 - error TS2307: Cannot find module '@radix-ui/react-navigation-menu@1.2.5' or its corresponding type declarations.

2 import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu@1.2.5";
                                           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/navigation-menu.tsx:3:21 - error TS2307: Cannot find module 'class-variance-authority@0.7.1' or its corresponding type declarations.

3 import { cva } from "class-variance-authority@0.7.1";
                      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/navigation-menu.tsx:4:33 - error TS2307: Cannot find module 'lucide-react@0.487.0' or its corresponding type declarations.

4 import { ChevronDownIcon } from "lucide-react@0.487.0";
                                  ~~~~~~~~~~~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/pagination.tsx:6:8 - error TS2307: Cannot find module 'lucide-react@0.487.0' or its corresponding type declarations.

6 } from "lucide-react@0.487.0";
         ~~~~~~~~~~~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/pagination.tsx:75:7 - error TS2783: 'size' is specified more than once, so this usage will be overwritten.

75       size="default"
         ~~~~~~~~~~~~~~

  components/Hospital Management System Template/src/components/ui/pagination.tsx:77:7
    77       {...props}
             ~~~~~~~~~~
    This spread always overwrites this property.

components/Hospital Management System Template/src/components/ui/pagination.tsx:92:7 - error TS2783: 'size' is specified more than once, so this usage will be overwritten.

92       size="default"
         ~~~~~~~~~~~~~~

  components/Hospital Management System Template/src/components/ui/pagination.tsx:94:7
    94       {...props}
             ~~~~~~~~~~
    This spread always overwrites this property.

components/Hospital Management System Template/src/components/ui/popover.tsx:4:35 - error TS2307: Cannot find module '@radix-ui/react-popover@1.1.6' or its corresponding type declarations.

4 import * as PopoverPrimitive from "@radix-ui/react-popover@1.1.6";
                                    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/progress.tsx:4:36 - error TS2307: Cannot find module '@radix-ui/react-progress@1.1.2' or its corresponding type declarations.

4 import * as ProgressPrimitive from "@radix-ui/react-progress@1.1.2";
                                     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/radio-group.tsx:4:38 - error TS2307: Cannot find module '@radix-ui/react-radio-group@1.2.3' or its corresponding type declarations.

4 import * as RadioGroupPrimitive from "@radix-ui/react-radio-group@1.2.3";
                                       ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/radio-group.tsx:5:28 - error TS2307: Cannot find module 'lucide-react@0.487.0' or its corresponding type declarations.

5 import { CircleIcon } from "lucide-react@0.487.0";
                             ~~~~~~~~~~~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/resizable.tsx:4:34 - error TS2307: Cannot find module 'lucide-react@0.487.0' or its corresponding type declarations.

4 import { GripVerticalIcon } from "lucide-react@0.487.0";
                                   ~~~~~~~~~~~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/resizable.tsx:5:37 - error TS2307: Cannot find module 'react-resizable-panels@2.1.7' or its corresponding type declarations.

5 import * as ResizablePrimitive from "react-resizable-panels@2.1.7";
                                      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/scroll-area.tsx:4:38 - error TS2307: Cannot find module '@radix-ui/react-scroll-area@1.2.3' or its corresponding type declarations.

4 import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area@1.2.3";
                                       ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/select.tsx:4:34 - error TS2307: Cannot find module '@radix-ui/react-select@2.1.6' or its corresponding type declarations.

4 import * as SelectPrimitive from "@radix-ui/react-select@2.1.6";
                                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/select.tsx:9:8 - error TS2307: Cannot find module 'lucide-react@0.487.0' or its corresponding type declarations.

9 } from "lucide-react@0.487.0";
         ~~~~~~~~~~~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/separator.tsx:4:37 - error TS2307: Cannot find module '@radix-ui/react-separator@1.1.2' or its corresponding type declarations.

4 import * as SeparatorPrimitive from "@radix-ui/react-separator@1.1.2";
                                      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/sheet.tsx:4:33 - error TS2307: Cannot find module '@radix-ui/react-dialog@1.1.6' or its corresponding type declarations.

4 import * as SheetPrimitive from "@radix-ui/react-dialog@1.1.6";
                                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/sheet.tsx:5:23 - error TS2307: Cannot find module 'lucide-react@0.487.0' or its corresponding type declarations.

5 import { XIcon } from "lucide-react@0.487.0";
                        ~~~~~~~~~~~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/sidebar.tsx:4:22 - error TS2307: Cannot find module '@radix-ui/react-slot@1.1.2' or its corresponding type declarations.

4 import { Slot } from "@radix-ui/react-slot@1.1.2";
                       ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/sidebar.tsx:5:35 - error TS2307: Cannot find module 'class-variance-authority@0.7.1' or its corresponding type declarations.

5 import { VariantProps, cva } from "class-variance-authority@0.7.1";
                                    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/sidebar.tsx:6:31 - error TS2307: Cannot find module 'lucide-react@0.487.0' or its corresponding type declarations.

6 import { PanelLeftIcon } from "lucide-react@0.487.0";
                                ~~~~~~~~~~~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/sidebar.tsx:270:17 - error TS7006: Parameter 'event' implicitly has an 'any' type.

270       onClick={(event) => {
                    ~~~~~

components/Hospital Management System Template/src/components/ui/slider.tsx:4:34 - error TS2307: Cannot find module '@radix-ui/react-slider@1.2.3' or its corresponding type declarations.

4 import * as SliderPrimitive from "@radix-ui/react-slider@1.2.3";
                                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/sonner.tsx:3:26 - error TS2307: Cannot find module 'next-themes@0.4.6' or its corresponding type declarations.

3 import { useTheme } from "next-themes@0.4.6";
                           ~~~~~~~~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/sonner.tsx:4:49 - error TS2307: Cannot find module 'sonner@2.0.3' or its corresponding type declarations.

4 import { Toaster as Sonner, ToasterProps } from "sonner@2.0.3";
                                                  ~~~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/switch.tsx:4:34 - error TS2307: Cannot find module '@radix-ui/react-switch@1.1.3' or its corresponding type declarations.

4 import * as SwitchPrimitive from "@radix-ui/react-switch@1.1.3";
                                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/tabs.tsx:4:32 - error TS2307: Cannot find module '@radix-ui/react-tabs@1.1.3' or its corresponding type declarations.

4 import * as TabsPrimitive from "@radix-ui/react-tabs@1.1.3";
                                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/toggle-group.tsx:4:39 - error TS2307: Cannot find module '@radix-ui/react-toggle-group@1.1.2' or its corresponding type declarations.

4 import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group@1.1.2";
                                        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/toggle-group.tsx:5:35 - error TS2307: Cannot find module 'class-variance-authority@0.7.1' or its corresponding type declarations.

5 import { type VariantProps } from "class-variance-authority@0.7.1";
                                    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/toggle.tsx:4:34 - error TS2307: Cannot find module '@radix-ui/react-toggle@1.1.2' or its corresponding type declarations.

4 import * as TogglePrimitive from "@radix-ui/react-toggle@1.1.2";
                                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/toggle.tsx:5:40 - error TS2307: Cannot find module 'class-variance-authority@0.7.1' or its corresponding type declarations.

5 import { cva, type VariantProps } from "class-variance-authority@0.7.1";
                                         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

components/Hospital Management System Template/src/components/ui/tooltip.tsx:4:35 - error TS2307: Cannot find module '@radix-ui/react-tooltip@1.1.8' or its corresponding type declarations.

4 import * as TooltipPrimitive from "@radix-ui/react-tooltip@1.1.8";
                                    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

components/Hospital Management System Template/src/main.tsx:3:19 - error TS5097: An import path can only end with a '.tsx' extension when 'allowImportingTsExtensions' is enabled.

3   import App from "./App.tsx";
                    ~~~~~~~~~~~

components/Hospital Management System Template/vite.config.ts:2:32 - error TS2307: Cannot find module 'vite' or its corresponding type declarations.

2   import { defineConfig } from 'vite';
                                 ~~~~~~

components/Hospital Management System Template/vite.config.ts:3:21 - error TS2307: Cannot find module '@vitejs/plugin-react-swc' or its corresponding type declarations.

3   import react from '@vitejs/plugin-react-swc';
                      ~~~~~~~~~~~~~~~~~~~~~~~~~~

components/medical/consultation-detail.tsx:136:23 - error TS2345: Argument of type '{ id: any; patient_id: any; doctor_id: any; centre_id: any; appointment_id: any; date: any; status: any; reason_for_visit: any; clinical_exam_notes: any; diagnosis: any; follow_up_date: any; created_at: any; patient: { ...; }[]; doctor: { ...; }[]; centre: { ...; }[]; appointment: { ...; }[]; }' is not assignable to parameter of type 'SetStateAction<Consultation | null>'.
  Type '{ id: any; patient_id: any; doctor_id: any; centre_id: any; appointment_id: any; date: any; status: any; reason_for_visit: any; clinical_exam_notes: any; diagnosis: any; follow_up_date: any; created_at: any; patient: { ...; }[]; doctor: { ...; }[]; centre: { ...; }[]; appointment: { ...; }[]; }' is not assignable to type 'Consultation'.
    Types of property 'patient' are incompatible.
      Type '{ id: any; first_name: any; last_name: any; medical_record_number: any; }[]' is missing the following properties from type 'Patient': id, first_name, last_name, medical_record_number

136       setConsultation(consultationData);
                          ~~~~~~~~~~~~~~~~

components/medical/consultation-detail.tsx:158:24 - error TS2345: Argument of type '{ id: any; timestamp: any; heart_rate: any; bp_systolic: any; bp_diastolic: any; temperature_celsius: any; oxygen_saturation: any; respiratory_rate: any; recorded_by_id: any; recorded_by: { first_name: any; last_name: any; }[]; }[]' is not assignable to parameter of type 'SetStateAction<VitalSignLog[]>'.
  Type '{ id: any; timestamp: any; heart_rate: any; bp_systolic: any; bp_diastolic: any; temperature_celsius: any; oxygen_saturation: any; respiratory_rate: any; recorded_by_id: any; recorded_by: { first_name: any; last_name: any; }[]; }[]' is not assignable to type 'VitalSignLog[]'.      
    Type '{ id: any; timestamp: any; heart_rate: any; bp_systolic: any; bp_diastolic: any; temperature_celsius: any; oxygen_saturation: any; respiratory_rate: any; recorded_by_id: any; recorded_by: { first_name: any; last_name: any; }[]; }' is not assignable to type 'VitalSignLog'.        
      Types of property 'recorded_by' are incompatible.
        Type '{ first_name: any; last_name: any; }[]' is missing the following properties from type 'Profile': id, first_name, last_name

158       setVitalSignLogs(vitalSignsData || []);
                           ~~~~~~~~~~~~~~~~~~~~

components/medical/emergency-management.tsx:121:22 - error TS2345: Argument of type '{ id: any; patient_id: any; doctor_in_charge_id: any; centre_id: any; admission_time: any; discharge_time: any; reason: any; triage_level: any; first_aid_notes: any; medical_notes: any; orientation: any; patient: { ...; }[]; doctor_in_charge: { ...; }[]; centre: { ...; }[]; }[]' is not assignable to parameter of type 'SetStateAction<Emergency[]>'. 
  Type '{ id: any; patient_id: any; doctor_in_charge_id: any; centre_id: any; admission_time: any; discharge_time: any; reason: any; triage_level: any; first_aid_notes: any; medical_notes: any; orientation: any; patient: { ...; }[]; doctor_in_charge: { ...; }[]; centre: { ...; }[]; }[]' is not assignable to type 'Emergency[]'.
    Type '{ id: any; patient_id: any; doctor_in_charge_id: any; centre_id: any; admission_time: any; discharge_time: any; reason: any; triage_level: any; first_aid_notes: any; medical_notes: any; orientation: any; patient: { ...; }[]; doctor_in_charge: { ...; }[]; centre: { ...; }[]; }' is not assignable to type 'Emergency'.
      Types of property 'patient' are incompatible.
        Type '{ first_name: any; last_name: any; medical_record_number: any; }[]' is missing the following properties from type 'Patient': id, first_name, last_name, medical_record_number

121       setEmergencies(emergenciesData || []);
                         ~~~~~~~~~~~~~~~~~~~~~

components/medical/emergency-management.tsx:281:16 - error TS2304: Cannot find name 'FileText'.

281               <FileText className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                   ~~~~~~~~

components/medical/hospitalization-detail.tsx:121:9 - error TS2322: Type '{ id: any; first_name: any; last_name: any; medical_record_number: any; } | { id: any; first_name: any; last_name: any; medical_record_number: any; }[]' is not assignable to type 'Patient'.
  Type '{ id: any; first_name: any; last_name: any; medical_record_number: any; }[]' is missing the following properties from type 'Patient': id, first_name, last_name, medical_record_number

121         patient: Array.isArray(hospitalizationData.patient) && hospitalizationData.patient.length > 0
            ~~~~~~~

  components/medical/hospitalization-detail.tsx:48:3
    48   patient: Patient;
         ~~~~~~~
    The expected type comes from property 'patient' which is declared here on type 'Hospitalization'

components/medical/hospitalization-detail.tsx:124:9 - error TS2322: Type '{ id: any; first_name: any; last_name: any; } | { id: any; first_name: any; last_name: any; }[]' is not assignable to type 'Profile | undefined'.
  Type '{ id: any; first_name: any; last_name: any; }[]' is missing the following properties from type 'Profile': id, first_name, last_name      

124         referring_doctor: Array.isArray(hospitalizationData.referring_doctor) && hospitalizationData.referring_doctor.length > 0
            ~~~~~~~~~~~~~~~~

  components/medical/hospitalization-detail.tsx:49:3
    49   referring_doctor?: Profile;
         ~~~~~~~~~~~~~~~~
    The expected type comes from property 'referring_doctor' which is declared here on type 'Hospitalization'

components/medical/hospitalization-detail.tsx:127:9 - error TS2322: Type '{ id: any; name: any; } | { id: any; name: any; }[]' is not assignable to type 'Centre'.
  Type '{ id: any; name: any; }[]' is missing the following properties from type 'Centre': id, name

127         centre: Array.isArray(hospitalizationData.centre) && hospitalizationData.centre.length > 0
            ~~~~~~

  components/medical/hospitalization-detail.tsx:50:3
    50   centre: Centre;
         ~~~~~~
    The expected type comes from property 'centre' which is declared here on type 'Hospitalization'

components/medical/medical-layout.tsx:54:69 - error TS2304: Cannot find name 'Bed'.

54       { href: "/hospitalizations", label: "Hospitalisations", icon: Bed },
                                                                       ~~~

components/medical/medical-layout.tsx:55:56 - error TS2304: Cannot find name 'AlertTriangle'.

55       { href: "/emergencies", label: "Urgences", icon: AlertTriangle },
                                                          ~~~~~~~~~~~~~

components/secretary/secretary-layout.tsx:29:30 - error TS1308: 'await' expressions are only allowed within async functions and at the top levels of modules.

29   const { data: { user } } = await supabase.auth.getUser();
                                ~~~~~

  components/secretary/secretary-layout.tsx:16:17
    16 export function SecretaryLayout({ children }: SecretaryLayoutProps) {
                       ~~~~~~~~~~~~~~~
    Did you mean to mark this function as 'async'?

components/secretary/secretary-layout.tsx:29:36 - error TS2304: Cannot find name 'supabase'.

29   const { data: { user } } = await supabase.auth.getUser();
                                      ~~~~~~~~

components/secretary/secretary-layout.tsx:31:35 - error TS1308: 'await' expressions are only allowed within async functions and at the top levels of modules.

31     const { data: profileData } = await supabase
                                     ~~~~~

  components/secretary/secretary-layout.tsx:16:17
    16 export function SecretaryLayout({ children }: SecretaryLayoutProps) {
                       ~~~~~~~~~~~~~~~
    Did you mean to mark this function as 'async'?

components/secretary/secretary-layout.tsx:31:41 - error TS2304: Cannot find name 'supabase'.

31     const { data: profileData } = await supabase
                                           ~~~~~~~~


Found 98 errors in 51 files.

Errors  Files
     2  components/admin/audit-log-viewer.tsx:94
     1  components/admin/staff-management.tsx:133
     3  components/Hospital Management System Template/src/components/DashboardView.tsx:3
     2  components/Hospital Management System Template/src/components/ui/accordion.tsx:4
     1  components/Hospital Management System Template/src/components/ui/alert-dialog.tsx:4
     1  components/Hospital Management System Template/src/components/ui/alert.tsx:2
     1  components/Hospital Management System Template/src/components/ui/aspect-ratio.tsx:3
     1  components/Hospital Management System Template/src/components/ui/avatar.tsx:4
     2  components/Hospital Management System Template/src/components/ui/badge.tsx:2
     2  components/Hospital Management System Template/src/components/ui/breadcrumb.tsx:2
     2  components/Hospital Management System Template/src/components/ui/button.tsx:2
     4  components/Hospital Management System Template/src/components/ui/calendar.tsx:4
     2  components/Hospital Management System Template/src/components/ui/carousel.tsx:6
     4  components/Hospital Management System Template/src/components/ui/chart.tsx:4
     2  components/Hospital Management System Template/src/components/ui/checkbox.tsx:4
     1  components/Hospital Management System Template/src/components/ui/collapsible.tsx:3
     2  components/Hospital Management System Template/src/components/ui/command.tsx:4
     2  components/Hospital Management System Template/src/components/ui/context-menu.tsx:4
     2  components/Hospital Management System Template/src/components/ui/dialog.tsx:4
     1  components/Hospital Management System Template/src/components/ui/drawer.tsx:4
     2  components/Hospital Management System Template/src/components/ui/dropdown-menu.tsx:4
     3  components/Hospital Management System Template/src/components/ui/form.tsx:4
     1  components/Hospital Management System Template/src/components/ui/hover-card.tsx:4
     3  components/Hospital Management System Template/src/components/ui/input-otp.tsx:4
     1  components/Hospital Management System Template/src/components/ui/label.tsx:4
     2  components/Hospital Management System Template/src/components/ui/menubar.tsx:4
     3  components/Hospital Management System Template/src/components/ui/navigation-menu.tsx:2
     3  components/Hospital Management System Template/src/components/ui/pagination.tsx:6
     1  components/Hospital Management System Template/src/components/ui/popover.tsx:4
     1  components/Hospital Management System Template/src/components/ui/progress.tsx:4
     2  components/Hospital Management System Template/src/components/ui/radio-group.tsx:4
     2  components/Hospital Management System Template/src/components/ui/resizable.tsx:4
     1  components/Hospital Management System Template/src/components/ui/scroll-area.tsx:4
     2  components/Hospital Management System Template/src/components/ui/select.tsx:4
     1  components/Hospital Management System Template/src/components/ui/separator.tsx:4
     2  components/Hospital Management System Template/src/components/ui/sheet.tsx:4
     4  components/Hospital Management System Template/src/components/ui/sidebar.tsx:4
     1  components/Hospital Management System Template/src/components/ui/slider.tsx:4
     2  components/Hospital Management System Template/src/components/ui/sonner.tsx:3
     1  components/Hospital Management System Template/src/components/ui/switch.tsx:4
     1  components/Hospital Management System Template/src/components/ui/tabs.tsx:4
     2  components/Hospital Management System Template/src/components/ui/toggle-group.tsx:4
     2  components/Hospital Management System Template/src/components/ui/toggle.tsx:4
     1  components/Hospital Management System Template/src/components/ui/tooltip.tsx:4
     1  components/Hospital Management System Template/src/main.tsx:3
     2  components/Hospital Management System Template/vite.config.ts:2
     2  components/medical/consultation-detail.tsx:136
     2  components/medical/emergency-management.tsx:121
     3  components/medical/hospitalization-detail.tsx:121
     2  components/medical/medical-layout.tsx:54
     4  components/secretary/secretary-layout.tsx:29
PS C:\Users\junio\sih> 