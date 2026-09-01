import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"

const CollapsibleContext = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
} | null>(null)

function Collapsible({
  open: openProp,
  onOpenChange,
  defaultOpen = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [openState, setOpenState] = React.useState(defaultOpen)
  const open = openProp ?? openState

  const setOpen = React.useCallback((value: boolean) => {
    if (onOpenChange) {
      onOpenChange(value)
    } else {
      setOpenState(value)
    }
  }, [onOpenChange])

  return (
    <CollapsibleContext.Provider value={{ open, setOpen }}>
      <div data-slot="collapsible" data-state={open ? "open" : "closed"} {...props}>
        {children}
      </div>
    </CollapsibleContext.Provider>
  )
}

function CollapsibleTrigger({
  render,
  onClick,
  ...props
}: React.ComponentProps<"button"> & { render?: React.ReactElement }) {
  const context = React.useContext(CollapsibleContext)
  if (!context) throw new Error("CollapsibleTrigger must be used inside a Collapsible component.")

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    context.setOpen(!context.open)
    if (onClick) onClick(e)
  }

  const defaultButton = (
    <button
      data-slot="collapsible-trigger"
      data-state={context.open ? "open" : "closed"}
      onClick={handleClick}
      {...props}
    />
  )

  if (render) {
    return React.cloneElement(render, {
      onClick: handleClick,
      "data-state": context.open ? "open" : "closed",
      ...props
    })
  }

  return defaultButton
}

function CollapsibleContent({
  children,
  ...props
}: React.ComponentProps<"div">) {
  const context = React.useContext(CollapsibleContext)
  if (!context) throw new Error("CollapsibleContent must be used inside a Collapsible component.")

  return (
    <AnimatePresence initial={false}>
      {context.open && (
        <div
          data-slot="collapsible-content"
          data-state="open"
          {...props}
        >
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
