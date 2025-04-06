import { ZodError } from "zod";
import QuestionValidator,{QuestionType} from "./question.validator";



export{zodError};



const zodError = (error: ZodError) => {
    let errors: any = {};
    error.errors.map((issue) => {
      const path = issue.path?.[0];
      if (path) errors[path] = issue.message;
    });
    return errors;
  };
