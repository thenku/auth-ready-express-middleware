
class FormInputModifierClass {
    cleanBody(body:Record<string,any>){
        const body2:Record<string, any> = {};
        for(const key in body){
            let value = body[key].trim();
            // value = decodeURIComponent(str) //already included in bodyParser
            value = this.clipLength(value, 100);
            value = this.escapeHtml(value);
            value = this.escapeSQL(value);
            body2[key] = value;
        }
        return body2;
    }
    private clipLength(str:string, length = 100){
        return str.slice(0, length);
    }
    private escapeHtml(str:string){
        return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
    private escapeSQL(str:string){
        return str.replace(/'/g, "''");
    }
    private escapeRegex(str:string){
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

  }
  const FormInputModifier = new FormInputModifierClass();
  export default FormInputModifier;