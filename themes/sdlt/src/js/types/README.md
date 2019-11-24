# Types

The "types" folder is where your model definitions go. In fact, the folder might
better be named "model" or "models".

Within each model is defined a map of file-names and field-types; such as "number", "string" or "boolean").
These are therefore the fields that will be exposed to consumers of the model.

Here's very basic prototype:

```javascript
export type Person = {
    id: string,
    nameFirst: string,
    nameLast: string,
    address: string,
    age: number,
    email: string,
};
```

Assuming the code above is placed into a file named: "js/types/Person.js" then it
would be imported like this:

`import type {Person} from "../../types/Person";`