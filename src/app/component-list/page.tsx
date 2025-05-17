import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex max-w-[200px] flex-col space-y-4 p-4">
      <p className="text-brand-500">this is a text</p>
      <Button>default</Button>
      <Button variant="primary">Primary</Button>
      <Button variant="primaryOutline">Primary Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="secondaryOutline">Secondary Outline</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="dangerOutline">Danger Outline</Button>
      <Button variant="super">Super</Button>
      <Button variant="superOutline">Super Outline</Button>
      <Button variant="defaultOutline">Default Outline</Button>
      <Button variant="sidebar">Sidebar</Button>
      <Button variant="sidebarOutline">Sidebar Outline</Button>
    </div>
  )
}
