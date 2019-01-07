import * as ts from "typescript";
import { StringCreator } from "./string-creator";

const grabJsx = [
  ts.SyntaxKind.JsxElement,
  ts.SyntaxKind.JsxFragment,
  ts.SyntaxKind.JsxSelfClosingElement
];

class Transformer {
  private typeChecker: ts.TypeChecker | undefined;
  constructor(
    program: ts.Program | undefined,
    private context: ts.TransformationContext
  ) {
    this.typeChecker = program && program.getTypeChecker();
  }

  getStringFromClosingElement(
    node: ts.JsxClosingElement,
    result: StringCreator
  ) {
    result.add(`</${node.tagName.getText()}>`);
  }

  getStringFromAttributes(node: ts.JsxAttributes, result: StringCreator) {
    for (const property of node.properties) {
      if (property.kind === ts.SyntaxKind.JsxSpreadAttribute) {
        result.add(
          " ",
          ts.createCall(
            ts.createPropertyAccess(
              ts.createCall(
                ts.createPropertyAccess(
                  ts.createIdentifier("Object"),
                  "entries"
                ),
                [],
                [ts.createSpread(property.expression)]
              ),
              "map"
            ),
            [],
            [
              ts.createArrowFunction(
                undefined,
                undefined,
                [
                  ts.createParameter(
                    undefined,
                    undefined,
                    undefined,
                    ts.createArrayBindingPattern([
                      ts.createBindingElement(
                        undefined,
                        undefined,
                        "key",
                        undefined
                      ),
                      ts.createBindingElement(
                        undefined,
                        undefined,
                        "value",
                        undefined
                      )
                    ]),
                    undefined,
                    undefined,
                    undefined
                  )
                ],
                undefined,
                undefined,
                new StringCreator(
                  ts.createIdentifier("key"),
                  '="',
                  ts.createIdentifier("value"),
                  '"'
                ).getTemplateExpression()
              )
            ]
          )
        );
      } else {
        if (
          property.initializer &&
          property.initializer.kind === ts.SyntaxKind.JsxExpression
        ) {
          result.add(
            ` ${property.name.getText()}="`,
            property.initializer.expression!,
            `"`
          );
        } else {
          result.add(" " + property.getText());
        }
      }
    }
  }

  getStringFromOpeningElement(
    node: ts.JsxOpeningElement,
    result: StringCreator
  ) {
    result.add(`<${node.tagName.getText()}`);
    this.getStringFromAttributes(node.attributes, result);
    result.add(">");
  }

  getObjectLiteralElementFromAttribute(
    property: ts.JsxAttributeLike
  ): ts.ObjectLiteralElementLike {
    if (property.kind === ts.SyntaxKind.JsxSpreadAttribute) {
      return ts.createSpreadAssignment(property.expression);
    }
    const name = property.name.getText();
    const value = property.initializer
      ? property.initializer.kind === ts.SyntaxKind.JsxExpression
        ? property.initializer.expression!
        : ts.createLiteral(property.initializer.text)
      : ts.createLiteral(true);
    return ts.createPropertyAssignment(name, value);
  }

  getStringFromJsxElementComponent(node: ts.JsxElement, result: StringCreator) {
    const parameters = node.openingElement.attributes.properties.map(
      this.getObjectLiteralElementFromAttribute.bind(this)
    );
    const childrenStringCreator = new StringCreator();
    for (const child of node.children) {
      this.getStringFromJsxChild(child, childrenStringCreator);
    }
    const childrenParameter = ts.createPropertyAssignment(
      "children",
      childrenStringCreator.getTemplateExpression()
    );
    parameters.push(childrenParameter);
    result.add(
      ts.createCall(
        node.openingElement.tagName,
        [],
        [ts.createObjectLiteral(parameters)]
      )
    );
  }

  getStringFromJsxElement(node: ts.JsxElement, result: StringCreator) {
    if (node.openingElement.tagName.getText().match(/[A-Z]/)) {
      this.getStringFromJsxElementComponent(node, result);
      return;
    }
    this.getStringFromOpeningElement(node.openingElement, result);
    for (const child of node.children) {
      this.getStringFromJsxChild(child, result);
    }
    this.getStringFromClosingElement(node.closingElement, result);
  }

  getStringFromJsxFragment(node: ts.JsxFragment, result: StringCreator) {
    for (const child of node.children) {
      this.getStringFromJsxChild(child, result);
    }
  }

  getStringFromJsxSelfClosingElementComponent(
    node: ts.JsxSelfClosingElement,
    result: StringCreator
  ) {
    const parameters = node.attributes.properties.map(
      this.getObjectLiteralElementFromAttribute.bind(this)
    );
    parameters.push(
      ts.createPropertyAssignment("children", ts.createLiteral(""))
    );
    result.add(
      ts.createCall(node.tagName, [], [ts.createObjectLiteral(parameters)])
    );
  }

  getStringFromJsxSelfClosingElement(
    node: ts.JsxSelfClosingElement,
    result: StringCreator
  ) {
    if (node.tagName.getText().match(/[A-Z]/)) {
      this.getStringFromJsxSelfClosingElementComponent(node, result);
      return;
    }
    result.add("<", node.tagName.getText());
    this.getStringFromAttributes(node.attributes, result);
    result.add(">");
    result.add("</", node.tagName.getText(), ">");
  }

  getStringFromJsxChild(node: ts.JsxChild, result: StringCreator) {
    switch (node.kind) {
      case ts.SyntaxKind.JsxElement:
        this.getStringFromJsxElement(node, result);
        break;
      case ts.SyntaxKind.JsxFragment:
        this.getStringFromJsxFragment(node, result);
        break;
      case ts.SyntaxKind.JsxSelfClosingElement:
        this.getStringFromJsxSelfClosingElement(node, result);
        break;
      case ts.SyntaxKind.JsxText:
        const text = node.getFullText().replace(/\n */, "");
        result.add(text);
        break;
      case ts.SyntaxKind.JsxExpression:
        const newNode = ts.visitNode(node.expression!, this.visit.bind(this));
        if (this.typeChecker) {
          const type = this.typeChecker.getTypeAtLocation(newNode);
          const symbol = type.getSymbol();
          if (symbol && symbol.getName() === "Array") {
            result.add(
              ts.createCall(
                ts.createPropertyAccess(newNode, "join"),
                [],
                [ts.createLiteral("")]
              )
            );
            break;
          }
        }
        result.add(newNode);
        break;
      default:
        throw new Error("NOT IMPLEMENTED"); // TODO improve error message
    }
    return result;
  }
  visit(node: ts.Node): ts.Node {
    if (grabJsx.indexOf(node.kind) !== -1) {
      const result = new StringCreator();
      this.getStringFromJsxChild(node as any, result);
      return result.getTemplateExpression();
    }
    return ts.visitEachChild(node, this.visit.bind(this), this.context);
  }
  transform<T extends ts.Node>(rootNode: T): T {
    return ts.visitNode(rootNode, this.visit.bind(this));
  }
}

function transformer<T extends ts.Node>(
  program: ts.Program
): ts.TransformerFactory<T>;
function transformer<T extends ts.Node>(
  context: ts.TransformationContext
): ts.Transformer<T>;
function transformer<T extends ts.Node>(
  programOrContext: ts.Program | ts.TransformationContext
) {
  if (isProgram(programOrContext)) {
    return (context: ts.TransformationContext) => (node: T) =>
      new Transformer(programOrContext, context).transform(node);
  }
  return (node: T) =>
    new Transformer(undefined, programOrContext).transform(node);
}

function isProgram(t: object): t is ts.Program {
  return "getTypeChecker" in t;
}

export default transformer;
