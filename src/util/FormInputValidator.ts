
class ValidatorClass {
  public isEmailBasic(email: string): boolean {
    // some logic here
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  
  equals(a: number | string, b: number | string): boolean {
    return a == b;
  }
}
const Validator = new ValidatorClass();
export default Validator;