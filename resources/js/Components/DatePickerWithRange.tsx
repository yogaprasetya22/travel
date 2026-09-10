import * as React from "react"
import { format, subDays, startOfMonth, endOfMonth, isSameDay } from "date-fns"
import { id } from "date-fns/locale"
import { Calendar as CalendarIcon, X, CalendarDays, Sparkles } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Calendar } from "@/Components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/Components/ui/popover"

interface DatePickerWithRangeProps {
  className?: string
  dateRange?: DateRange | undefined
  onChange?: (dateRange: DateRange | undefined) => void
  placeholder?: string
}

export function DatePickerWithRange({
  className,
  dateRange,
  onChange,
  placeholder = "Pilih rentang tanggal...",
}: DatePickerWithRangeProps) {
  const [selectedRange, setSelectedRange] = React.useState<DateRange | undefined>(dateRange)

  React.useEffect(() => {
    setSelectedRange(dateRange)
  }, [dateRange])

  const handleSelect = (range: DateRange | undefined) => {
    setSelectedRange(range)
    if (onChange) {
      onChange(range)
    }
  }

  const setPreset = (from: Date, to: Date) => {
    const range = { from, to }
    setSelectedRange(range)
    if (onChange) {
      onChange(range)
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedRange(undefined)
    if (onChange) {
      onChange(undefined)
    }
  }

  const isTodayActive = selectedRange?.from && selectedRange?.to && isSameDay(selectedRange.from, new Date()) && isSameDay(selectedRange.to, new Date())
  const is7DaysActive = selectedRange?.from && selectedRange?.to && isSameDay(selectedRange.from, subDays(new Date(), 7)) && isSameDay(selectedRange.to, new Date())
  const is30DaysActive = selectedRange?.from && selectedRange?.to && isSameDay(selectedRange.from, subDays(new Date(), 30)) && isSameDay(selectedRange.to, new Date())
  const isThisMonthActive = selectedRange?.from && selectedRange?.to && isSameDay(selectedRange.from, startOfMonth(new Date())) && isSameDay(selectedRange.to, endOfMonth(new Date()))

  return (
    <div className={cn("w-full", className)}>
      <Popover>
        <PopoverTrigger
          className={cn(
            "flex w-full items-center justify-between gap-2 px-3 py-2 text-xs font-medium rounded-xl border border-border bg-background hover:bg-muted/40 transition cursor-pointer text-foreground shadow-xs focus:outline-none focus:ring-2 focus:ring-primary/20",
            !selectedRange?.from && "text-muted-foreground"
          )}
        >
          <div className="flex items-center gap-2 truncate">
            <CalendarIcon className="w-4 h-4 text-primary shrink-0" />
            {selectedRange?.from ? (
              selectedRange.to ? (
                <span className="truncate font-semibold text-foreground">
                  {format(selectedRange.from, "dd MMM yyyy", { locale: id })} —{" "}
                  {format(selectedRange.to, "dd MMM yyyy", { locale: id })}
                </span>
              ) : (
                <span className="font-semibold text-foreground">{format(selectedRange.from, "dd MMM yyyy", { locale: id })}</span>
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </div>

          {selectedRange?.from && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition"
              title="Reset Tanggal"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4 rounded-2xl shadow-xl border border-border bg-card" align="start">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Quick Presets */}
            <div className="flex flex-col gap-1.5 sm:border-r border-b sm:border-b-0 border-border/80 pb-3 sm:pb-0 sm:pr-4 min-w-[130px]">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 px-1">
                <Sparkles className="w-3 h-3 text-primary" />
                <span>Pilihan Cepat</span>
              </div>
              <button
                type="button"
                onClick={() => setPreset(new Date(), new Date())}
                className={cn(
                  "text-left px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer",
                  isTodayActive
                    ? "bg-primary text-primary-foreground font-bold shadow-xs"
                    : "text-foreground hover:bg-muted/60"
                )}
              >
                Hari Ini
              </button>
              <button
                type="button"
                onClick={() => setPreset(subDays(new Date(), 7), new Date())}
                className={cn(
                  "text-left px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer",
                  is7DaysActive
                    ? "bg-primary text-primary-foreground font-bold shadow-xs"
                    : "text-foreground hover:bg-muted/60"
                )}
              >
                7 Hari Terakhir
              </button>
              <button
                type="button"
                onClick={() => setPreset(subDays(new Date(), 30), new Date())}
                className={cn(
                  "text-left px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer",
                  is30DaysActive
                    ? "bg-primary text-primary-foreground font-bold shadow-xs"
                    : "text-foreground hover:bg-muted/60"
                )}
              >
                30 Hari Terakhir
              </button>
              <button
                type="button"
                onClick={() => setPreset(startOfMonth(new Date()), endOfMonth(new Date()))}
                className={cn(
                  "text-left px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer",
                  isThisMonthActive
                    ? "bg-primary text-primary-foreground font-bold shadow-xs"
                    : "text-foreground hover:bg-muted/60"
                )}
              >
                Bulan Ini
              </button>
            </div>

            {/* Calendar */}
            <div className="flex flex-col">
              <Calendar
                mode="range"
                defaultMonth={selectedRange?.from || new Date()}
                selected={selectedRange}
                onSelect={handleSelect}
                numberOfMonths={1}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
