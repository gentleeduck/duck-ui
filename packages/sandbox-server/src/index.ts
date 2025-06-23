function first() {
  console.log('first(): factory evaluated')
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    console.log('first(): called')
  }
}

function second(name: string) {
  console.log('second(): factory evaluated')
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    console.log('second(): called', name)
  }
}

class ExampleClass {
  @first()
  @second('wildduck')
  method() {}
}

new ExampleClass().method()
