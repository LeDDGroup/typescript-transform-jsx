import routes from "../routes";

const links = [
  { id: "home", url: routes.home(), text: "Home" },
  { id: "users", url: routes.user.index(), text: "Users" }
];

export default (props: {
  title: string;
  active: "home" | "users";
  children?: any;
}) =>
  "<!DOCTYPE html>" +
  (
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>{props.title}</title>
      </head>
      <navbar>
        <ul>
          {links
            .map(({ id, url, text }) => (
              <li>
                {id === props.active ? (
                  <h3>
                    <a href={url}>{text}</a>
                  </h3>
                ) : (
                  <a href={url}>{text}</a>
                )}
              </li>
            ))
            .join("")}
        </ul>
      </navbar>
      <body>{props.children}</body>
    </html>
  );
