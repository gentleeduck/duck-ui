import { Checkbox } from '@gentleduck/registry-ui/checkbox'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from '@gentleduck/registry-ui/field'
import { Switch } from '@gentleduck/registry-ui/switch'

export default function Demo() {
  return (
    <div className="w-full max-w-md">
      <FieldGroup>
        <FieldSet>
          <FieldLegend variant="label">Notifications</FieldLegend>
          <FieldDescription>Pick where updates reach you.</FieldDescription>
          <FieldGroup className="gap-3">
            <FieldLabel htmlFor="notify-email-c7q">
              <Field orientation="horizontal">
                <Checkbox defaultChecked id="notify-email-c7q" />
                <FieldContent>
                  <FieldTitle>Email</FieldTitle>
                  <FieldDescription>A digest of the day&apos;s activity.</FieldDescription>
                </FieldContent>
              </Field>
            </FieldLabel>
            <FieldLabel htmlFor="notify-push-m2d">
              <Field orientation="horizontal">
                <Checkbox id="notify-push-m2d" />
                <FieldContent>
                  <FieldTitle>Push</FieldTitle>
                  <FieldDescription>Mentions and replies, as they happen.</FieldDescription>
                </FieldContent>
              </Field>
            </FieldLabel>
          </FieldGroup>
        </FieldSet>
        <FieldLabel htmlFor="share-usage-k8v">
          <Field orientation="horizontal">
            <FieldContent>
              <FieldTitle>Share usage data</FieldTitle>
              <FieldDescription>Help improve the product with anonymous usage data.</FieldDescription>
            </FieldContent>
            <Switch id="share-usage-k8v" />
          </Field>
        </FieldLabel>
      </FieldGroup>
    </div>
  )
}
