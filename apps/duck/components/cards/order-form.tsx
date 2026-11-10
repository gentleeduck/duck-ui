'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@gentleduck/registry-ui/card'
import { Checkbox } from '@gentleduck/registry-ui/checkbox'
import { Input } from '@gentleduck/registry-ui/input'
import { Label } from '@gentleduck/registry-ui/label'
import { RadioGroup, RadioGroupItem } from '@gentleduck/registry-ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@gentleduck/registry-ui/select'
import { AlertTriangle, Check, Lock } from 'lucide-react'
import { useState } from 'react'

export function OrderForm() {
  const [formData, setFormData] = useState({
    cardNumber: '1234 5678 9012 3456',
    city: 'New York',
    cvv: '123',
    dataUsage: '50-250mb',
    email: 'hello@gentleduck.org',
    expiryMonth: '12',
    expiryYear: '2025',
    firstName: 'wild',
    lastName: 'duck',
    promoCode: '299',
    radioTech: '4g-lte',
    signUpOffers: false,
    state: 'california',
    streetAddress: '123 Main St',
    suite: 'Apt 1',
    zip: '10001',
    zipCode: '10001',
  })

  const [errors, setErrors] = useState({
    email: false,
  })

  const [promoValid, setPromoValid] = useState(false)

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    if (field === 'email') {
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value as string)
      setErrors((prev) => ({ ...prev, email: !isValid && value !== '' }))
    }

    if (field === 'promoCode') {
      setPromoValid(value === 'SIMS4YOU')
    }
  }

  return (
    <div className="col-span-4 w-full">
      <Card className="py-6">
        <CardHeader className="sr-only">
          <CardTitle className="sr-only">Place Your Order</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 px-6">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="email2">Email address</Label>
            <div className="relative">
              <Input
                aria-describedby={errors.email ? 'email-error' : undefined}
                aria-invalid={errors.email}
                className={errors.email ? 'border-red-500' : ''}
                id="email2"
                onChange={(e) => handleInputChange('email', e.currentTarget.value)}
                placeholder="your@email.com"
                type="email"
                value={formData.email}
              />
              {errors.email && (
                <AlertTriangle aria-hidden="true" className="absolute top-3 right-3 h-4 w-4 text-red-500" />
              )}
            </div>
            {errors.email && (
              <p className="flex items-center gap-1 text-red-500 text-sm" id="email-error" role="alert">
                INVALID EMAIL ADDRESS
              </p>
            )}
          </div>

          <div className="flex flex-col space-y-2">
            <Label>Full name</Label>
            <div className="grid grid-cols-2 gap-4">
              <Input
                aria-label="First name"
                onChange={(e) => handleInputChange('firstName', e.currentTarget.value)}
                placeholder="First name"
                value={formData.firstName}
              />
              <Input
                aria-label="Last name"
                onChange={(e) => handleInputChange('lastName', e.currentTarget.value)}
                placeholder="Last name"
                value={formData.lastName}
              />
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <Label>Address</Label>
            <Input
              aria-label="Street address"
              onChange={(e) => handleInputChange('streetAddress', e.currentTarget.value)}
              placeholder="Street Address"
              value={formData.streetAddress}
            />
            <Input
              aria-label="Office, suite, apt."
              onChange={(e) => handleInputChange('suite', e.currentTarget.value)}
              placeholder="Office, Suite, Apt."
              value={formData.suite}
            />
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <Label className="text-sm" htmlFor="city">
                  City
                </Label>
                <Input
                  id="city"
                  onChange={(e) => handleInputChange('city', e.currentTarget.value)}
                  value={formData.city}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-sm" htmlFor="state">
                  State
                </Label>
                <Select onValueChange={(value) => handleInputChange('state', value)} value={formData.state}>
                  <SelectTrigger id="state">
                    <SelectValue placeholder="Choose..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="illinois">Illinois</SelectItem>
                    <SelectItem value="california">California</SelectItem>
                    <SelectItem value="texas">Texas</SelectItem>
                    <SelectItem value="newyork">New York</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-sm" htmlFor="zip">
                  Zip
                </Label>
                <Input
                  id="zip"
                  onChange={(e) => handleInputChange('zip', e.currentTarget.value)}
                  value={formData.zip}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <Label>Payment details</Label>
            <div className="relative">
              <div className="flex items-center gap-2 rounded-md border px-3">
                <Lock aria-hidden="true" className="size-8" />
                <Input
                  aria-label="Card number"
                  className="border-0 bg-transparent p-0 focus-visible:ring-0"
                  onChange={(e) => handleInputChange('cardNumber', e.currentTarget.value)}
                  placeholder="0000 0000 0000 0000"
                  value={formData.cardNumber}
                />
                <div className="flex items-center gap-8">
                  <Input
                    aria-label="Expiry date"
                    className="w-16 border-0 bg-transparent p-0 focus-visible:ring-0"
                    onChange={(e) => {
                      const [month, year] = e.currentTarget.value.split('/')
                      handleInputChange('expiryMonth', month || '')
                      handleInputChange('expiryYear', year || '')
                    }}
                    placeholder="MM/YY"
                    value={`${formData.expiryMonth}/${formData.expiryYear}`}
                  />
                  <Input
                    aria-label="CVV"
                    className="w-12 border-0 bg-transparent p-0 focus-visible:ring-0"
                    onChange={(e) => handleInputChange('cvv', e.currentTarget.value)}
                    placeholder="CVV"
                    value={formData.cvv}
                  />
                  <Input
                    aria-label="Billing ZIP code"
                    className="w-16 border-0 bg-transparent p-0 focus-visible:ring-0"
                    onChange={(e) => handleInputChange('zipCode', e.currentTarget.value)}
                    placeholder="ZIP"
                    value={formData.zipCode}
                  />
                </div>
              </div>
              <p className="mt-1 text-xs">ENCRYPTED AND SECURED</p>
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <Label>What radio technologies are you using?</Label>
            <RadioGroup
              className="flex flex-row gap-6"
              onValueChange={(value) => handleInputChange('radioTech', value ?? '')}
              value={formData.radioTech}>
              <RadioGroupItem value="2g">2G</RadioGroupItem>
              <RadioGroupItem value="3g">3G</RadioGroupItem>
              <RadioGroupItem value="4g-lte">4G LTE</RadioGroupItem>
              <RadioGroupItem value="cat-m">CAT M</RadioGroupItem>
            </RadioGroup>
          </div>

          <div className="flex flex-col space-y-2">
            <Label>How much data do you expect to use each month?</Label>
            <RadioGroup
              className="flex flex-row gap-6"
              onValueChange={(value) => handleInputChange('dataUsage', value ?? '')}
              value={formData.dataUsage}>
              <RadioGroupItem value="0-50mb">0-50 MB</RadioGroupItem>
              <RadioGroupItem value="50-250mb">50 MB-250 MB</RadioGroupItem>
              <RadioGroupItem value="250mb-1gb">250 MB-1 GB</RadioGroupItem>
              <RadioGroupItem value="1gb+">1 GB+</RadioGroupItem>
            </RadioGroup>
          </div>

          <div className="flex flex-col space-y-2">
            <Label htmlFor="promo">Promo code</Label>
            <div className="relative">
              <Input
                className={promoValid ? 'border-green-500' : ''}
                id="promo"
                onChange={(e) => handleInputChange('promoCode', e.currentTarget.value)}
                value={formData.promoCode}
              />
              {promoValid && <Check aria-hidden="true" className="absolute top-3 right-3 h-4 w-4" />}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={formData.signUpOffers}
                className="mr-2"
                id="offers"
                onCheckedChange={(checked) => handleInputChange('signUpOffers', checked as boolean)}
              />
              <Label className="text-sm" htmlFor="offers">
                Sign me up for annoying offers
              </Label>
            </div>
            <Button className="w-fit">Place order</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
