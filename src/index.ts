import * as ts from "typescript";
import { StringCreator } from "./string-creator";

function transform<T extends ts.Node>(
  program: ts.Program | undefined,
  context: ts.TransformationContext,
  rootNode: T
): T {
  const typeChecker = program && program.getTypeChecker();

  const grabJsx = [
    ts.SyntaxKind.JsxElement,
    ts.SyntaxKind.JsxFragment,
    ts.SyntaxKind.JsxSelfClosingElement
  ];

  function getStringFromClosingElement(
    node: ts.JsxClosingElement,
    result: StringCreator
  ) {
    result.add(`</${node.tagName.getText()}>`);
  }

  function getStringFromAttributes(
    node: ts.JsxAttributes,
    result: StringCreator
  ) {
    for (const property of node.properties) {
      if (property.kind === ts.SyntaxKind.JsxSpreadAttribute) {
        throw new Error("Spread operator not implemented");
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

  function getStringFromOpeningElement(
    node: ts.JsxOpeningElement,
    result: StringCreator
  ) {
    result.add(`<${node.tagName.getText()}`);
    getStringFromAttributes(node.attributes, result);
    result.add(">");
  }

  function getObjectLiteralElementFromAttribute(
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

  function getStringFromJsxElementComponent(
    node: ts.JsxElement,
    result: StringCreator
  ) {
    const parameters = node.openingElement.attributes.properties.map(
      getObjectLiteralElementFromAttribute
    );
    const childrenStringCreator = new StringCreator();
    for (const child of node.children) {
      getStringFromJsxChild(child, childrenStringCreator);
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

  function getStringFromJsxElement(node: ts.JsxElement, result: StringCreator) {
    if (node.openingElement.tagName.getText().match(/[A-Z]/)) {
      getStringFromJsxElementComponent(node, result);
      return;
    }
    getStringFromOpeningElement(node.openingElement, result);
    for (const child of node.children) {
      getStringFromJsxChild(child, result);
    }
    getStringFromClosingElement(node.closingElement, result);
  }

  function getStringFromJsxFragment(
    node: ts.JsxFragment,
    result: StringCreator
  ) {
    for (const child of node.children) {
      getStringFromJsxChild(child, result);
    }
  }

  function getStringFromJsxSelfClosingElementComponent(
    node: ts.JsxSelfClosingElement,
    result: StringCreator
  ) {
    const parameters = node.attributes.properties.map(
      getObjectLiteralElementFromAttribute
    );
    parameters.push(
      ts.createPropertyAssignment("children", ts.createLiteral(""))
    );
    result.add(
      ts.createCall(node.tagName, [], [ts.createObjectLiteral(parameters)])
    );
  }

  function getStringFromJsxSelfClosingElement(
    node: ts.JsxSelfClosingElement,
    result: StringCreator
  ) {
    if (node.tagName.getText().match(/[A-Z]/)) {
      getStringFromJsxSelfClosingElementComponent(node, result);
      return;
    }
    result.add("<", node.tagName.getText());
    getStringFromAttributes(node.attributes, result);
    result.add(">");
    result.add("</", node.tagName.getText(), ">");
  }

  function getStringFromJsxChild(
    node: ts.JsxChild,
    result = new StringCreator()
  ) {
    switch (node.kind) {
      case ts.SyntaxKind.JsxElement:
        getStringFromJsxElement(node, result);
        break;
      case ts.SyntaxKind.JsxFragment:
        getStringFromJsxFragment(node, result);
        break;
      case ts.SyntaxKind.JsxSelfClosingElement:
        getStringFromJsxSelfClosingElement(node, result);
        break;
      case ts.SyntaxKind.JsxText:
        const text = node.getFullText().replace(/\n */, "");
        result.add(text);
        break;
      case ts.SyntaxKind.JsxExpression:
        const newNode = ts.visitNode(node.expression!, visit);
        if (typeChecker) {
          const type = typeChecker.getTypeAtLocation(newNode);
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

  function visit(node: ts.Node): ts.Node {
    if (grabJsx.indexOf(node.kind) !== -1)
      return getStringFromJsxChild(node as any).getTemplateExpression();
    return ts.visitEachChild(node, visit, context);
  }
  return ts.visitNode(rootNode, visit);
}

function transformer<T extends ts.Node>(program: ts.Program): ts.Transformer<T>;
function transformer<T extends ts.Node>(
  context: ts.TransformationContext
): (node: T) => T;
function transformer<T extends ts.Node>(
  programOrContext: ts.Program | ts.TransformationContext
) {
  if (isProgram(programOrContext)) {
    return (context: ts.TransformationContext) => (node: T) =>
      transform(programOrContext, context, node);
  }
  return (node: T) => transform(undefined, programOrContext, node);
}

function isProgram(t: object): t is ts.Program {
  return "getTypeChecker" in t;
}

export default transformer;
