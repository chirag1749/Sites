export class Person{
    id:string;
    data:Identity;
    rels:Relatives;

    constructor(id: string, data:Identity)
    {
        this.id = id;
        this.data = data;
        this.rels = new Relatives();
    }

    AddSpouces(spouses: Person[])
    {
        for (var spouce of spouses) {
            this.AddSpouce(spouce);
          }
    }

    AddSpouce(spouse: Person)
    {
        this.rels.spouses.push(spouse.id);
        spouse.rels.spouses.push(this.id);
    }

    AddChildren(children: Person[])
    {
        for (var child of children) {
            this.AddChild(child);
          }
    }

    AddChild(child: Person)
    {
        this.rels.children.push(child.id);
        if (this.data.gender == "M")
            child.rels.father = this.id;
        else
            child.rels.mother = this.id;
    }

    AddFather(father: Person)
    {
        this.rels.father = father.id;
        father.AddChild(this);
    }

    AddMother(mother: Person)
    {
        this.rels.mother = mother.id;
        mother.AddChild(this);
    }
}

export class Identity{

    firstName: string;
    lastName: string;
    gender:string;
    birthday:string

    constructor(firstName: string, lastName:string, gender:string);
    constructor(firstName: string, lastName:string, gender:string, birthday?:string)
    {
        this.firstName = firstName;
        this.lastName = lastName;
        this.gender = gender;
        this.birthday = birthday?? "";
    }
}

class Relatives{
    mother:string = "";
    father:string = "";
    spouses:string[] = [];
    children:string[] = [];
}