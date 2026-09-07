import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, getDefaultClassNames } from "react-day-picker"
import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 select-none", className)}
      classNames={{
        root: "w-fit",
        months: "flex flex-col sm:flex-row gap-4 relative",
        month: "space-y-4",
        month_caption: "flex justify-center items-center h-8 relative mb-2",
        caption_label: "text-sm font-semibold text-foreground tracking-wide",
        nav: "flex items-center justify-between absolute inset-x-0 top-0 z-10 px-1 pointer-events-none",
        button_previous: "h-7 w-7 bg-background/80 hover:bg-muted border border-border/60 p-0 text-muted-foreground hover:text-foreground flex items-center justify-center rounded-lg transition shadow-xs pointer-events-auto cursor-pointer",
        button_next: "h-7 w-7 bg-background/80 hover:bg-muted border border-border/60 p-0 text-muted-foreground hover:text-foreground flex items-center justify-center rounded-lg transition shadow-xs pointer-events-auto cursor-pointer",
        month_grid: "w-full border-collapse space-y-1 mt-2",
        weekdays: "grid grid-cols-7 mb-2 text-center",
        weekday: "text-muted-foreground font-medium text-[11px] uppercase tracking-wider py-1",
        week: "grid grid-cols-7 gap-1 mt-1 text-center items-center",
        day: "h-8 w-8 p-0 text-xs font-medium rounded-lg transition-all flex items-center justify-center relative",
        day_button: "w-full h-full flex items-center justify-center rounded-lg text-foreground hover:bg-primary/15 hover:text-primary transition font-medium",
        selected: "bg-primary text-primary-foreground font-bold hover:bg-primary hover:text-primary-foreground shadow-xs",
        today: "font-bold text-primary border border-primary/40 bg-primary/5",
        outside: "text-muted-foreground/30 opacity-40 hover:bg-transparent",
        disabled: "text-muted-foreground/20 opacity-25 cursor-not-allowed",
        range_start: "rounded-l-lg rounded-r-none bg-primary text-primary-foreground font-bold shadow-xs",
        range_end: "rounded-r-lg rounded-l-none bg-primary text-primary-foreground font-bold shadow-xs",
        range_middle: "bg-primary/20 text-primary font-semibold rounded-none hover:bg-primary/30",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          return orientation === "left" ? (
            <ChevronLeft className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )
        },
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
