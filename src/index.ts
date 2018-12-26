import * as ts from "typescript";
import { StringCreator } from "./string-creator";

const transformer = <T extends ts.Node>(context: ts.TransformationContext) => (
  rootNode: T
) => {
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
          result.add(" " + property.name.getText() + "=");
          result.add(property.initializer.expression!);
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

  function getStringFromJsxElement(node: ts.JsxElement, result: StringCreator) {
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

  function getStringFromJsxSelfClosingElement(
    node: ts.JsxSelfClosingElement,
    result: StringCreator
  ) {
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
        result.add(ts.visitNode(node.expression!, visit));
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
};

export default transformer;
