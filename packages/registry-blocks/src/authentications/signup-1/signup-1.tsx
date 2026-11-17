'use client'
import { cn } from '@gentleduck/libs/cn'
import { Avatar, AvatarFallback, AvatarImage } from '@gentleduck/registry-ui/avatar'
import { Button } from '@gentleduck/registry-ui/button'
import { Checkbox } from '@gentleduck/registry-ui/checkbox'
import { Input } from '@gentleduck/registry-ui/input'
import { Label } from '@gentleduck/registry-ui/label'
import { Separator } from '@gentleduck/registry-ui/separator'
import { Upload } from 'lucide-react'
import Image from 'next/image'
import type React from 'react'
import { icons } from './signup-1.constants'

export default function Signup1({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 overflow-auto rounded-2xl border border-border bg-card lg:grid-cols-2',
        className,
      )}
      style={
        {
          '--color-accent': '#535353',
          '--color-destructive': '#AC0F42',
          '--color-destructive-foreground': '#FEF2F6',
          '--color-muted': '#8C8C96',
          '--color-primary': '#2854d0',
          '--font-sans': '"Inter", sans-serif',
          fontFamily: 'var(--font-sans)',
          margin: '3rem',
        } as React.CSSProperties
      }>
      <style>@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');</style>
      {/* Left Side */}
      <div className="flex flex-col gap-4 p-5 sm:p-12 lg:border-border lg:border-e xl:p-18 xl:px-22" id="left-side">
        {/* Title */}
        <h2 className="font-semibold text-2xl">Signup</h2>

        {/* Steps */}
        <div className="mb-2 grid items-center justify-between gap-4 xl:flex">
          <div className="flex items-center gap-3">
            <div className="grid size-9 shrink-0 place-content-center rounded-lg bg-[var(--color-primary)]">
              <icons.userFilled className="size-4 fill-primary-foreground dark:fill-accent-foreground" />
            </div>
            <h3 className="font-semibold text-primary/90 text-xl">Personal Information</h3>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                className={cn(
                  'grid size-8 place-content-center rounded-full bg-muted font-semibold text-muted-foreground',
                  step === 1 && 'bg-foreground text-accent',
                )}
                key={`step-${step}`}>
                {step}
              </div>
            ))}
          </div>
        </div>

        {/* Upload */}
        <div className="flex items-start gap-4">
          <div className="size-[100px] shrink-0 overflow-hidden rounded-xl bg-muted">
            <Avatar className="size-[100px] rounded-xl">
              <AvatarImage alt="WD" src="/avatars/06.png" />
              <AvatarFallback className="rounded-xl">WD</AvatarFallback>
            </Avatar>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="font-medium text-lg">Profile Picture</h3>
            <div className="item-center grid gap-2 sm:flex">
              <Button
                className="hover:bg-secondary/80 dark:bg-secondary dark:text-accent-foreground"
                icon={<Upload className="text-[var(--color-muted)]" />}>
                Upload Image
              </Button>
              <Button
                className="bg-[var(--color-destructive-foreground)] text-[var(--color-destructive)] hover:bg-[var(--color-destructive)]/20 dark:bg-destructive/20 dark:hover:bg-destructive/10"
                variant={'destructive'}>
                Remove
              </Button>
            </div>
            <p className="text-[var(--color-muted)] text-sm">.png, .jpg, files up to 10mb at least 400px by 400px</p>
          </div>
        </div>

        <Separator className="my-4 border-t-2 border-dashed bg-transparent" />

        {/* Form */}
        <form className="flex flex-col gap-2 [&_input]:border-[1.5px] [&_input]:bg-[var(--color-muted)]/10 [&_input]:placeholder:font-normal [&_input]:placeholder:text-[var(--color-muted)] [&_label]:text-[var(--color-accent)] dark:[&_label]:text-accent-foreground">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="mb-2 flex flex-col gap-2">
              <Label htmlFor="first-name">First Name</Label>
              <Input id="first-name" placeholder="Enter your first name.." />
            </div>
            <div className="mb-2 flex flex-col gap-2">
              <Label htmlFor="last-name">Last Name</Label>
              <Input id="last-name" placeholder="Enter your last name.." />
            </div>
          </div>

          <div className="grid grid-cols-1">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" placeholder="your@email.com" />
            </div>
          </div>
        </form>

        <Separator className="my-4 border-t-2 border-dashed bg-transparent" />

        {/* Terms */}
        <div className="mb-8 flex items-start gap-2">
          <Checkbox
            className="mt-1 h-5 w-5 checked:border-[var(--color-primary)] checked:bg-[var(--color-primary)] dark:checked:text-accent-foreground"
            id="terms"
          />
          <div className="flex flex-col">
            <Label className="text-[var(--color-accent)] text-lg dark:text-accent-foreground" htmlFor="terms">
              Subscribe to product update email
            </Label>
            <p className="text-[var(--color-muted)]">Get latest updates about features and product updates</p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col justify-end gap-2 rounded-2xl">
          <Button
            className="rounded-lg bg-[var(--color-primary)] text-primary-foreground hover:bg-[var(--color-primary)]/90 dark:text-accent-foreground"
            size={'lg'}>
            Continue
          </Button>
          <Button className="rounded-lg" size={'lg'} variant={'secondary'}>
            You already have an account ?<span className="font-semibold underline"> Sign in</span>
          </Button>
        </div>
      </div>

      {/* Right Side */}
      <div
        className="hidden h-full flex-col gap-4 overflow-hidden px-16 pe-0 pt-16 lg:flex xl:ps-22 xl:pt-18"
        id="right-side">
        <div className="relative h-full w-full">
          <Image alt="" className="hidden object-cover object-left-top dark:block" fill src="/login.jpg" />
          <Image alt="" className="block object-cover object-left-top dark:hidden" fill src="/login-light.jpg" />
        </div>
      </div>
    </div>
  )
}
