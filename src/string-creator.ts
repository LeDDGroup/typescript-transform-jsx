import * as ts from "typescript";

export class StringCreator {
  private body: [ts.Expression, string][] = [[null as any, ""]];
  public add(...els: (ts.Expression | string)[]) {
    for (const el of els) {
      if (typeof el === "string") {
        this.body[this.body.length - 1][1] += el;
      } else {
        this.body.push([el, ""]);
      }
    }
  }
  public getTemplateExpression():
    | ts.TemplateExpression
    | ts.StringLiteral
    | ts.Expression {
    if (this.body.length === 1) return ts.createLiteral(this.body[0][1]);
    if (
      this.body.length === 2 &&
      this.body[0][1] === "" &&
      this.body[1][1] === ""
    ) {
      return this.body[1][0];
    }
    const head = ts.createTemplateHead(this.body[0][1]);
    const body = this.body.slice(1).map(([node, lit], index, arr) => {
      return ts.createTemplateSpan(
        node,
        index === arr.length - 1
          ? ts.createTemplateTail(lit)
          : ts.createTemplateMiddle(lit)
      );
    });
    return ts.createTemplateExpression(head, body);
  }
}
