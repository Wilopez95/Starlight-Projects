import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function RequirePropertyIfNotNull(property: string, validationOptions?: ValidationOptions) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  return function (object: any, propertyName: string): void {
    registerDecorator({
      name: 'RequirePropertyIfNotNull',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        validate(value: any, args: ValidationArguments): boolean {
          const [relatedPropertyName] = args.constraints;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const relatedValue = (args.object as any)[relatedPropertyName];

          if (!value) {
            return true;
          }

          return !!relatedValue;
        },
      },
    });
  };
}
