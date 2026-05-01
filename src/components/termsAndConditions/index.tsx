import { TERMS_PAGES } from "@/constants/termsPages"

export default function Index({ prefix, currentURI }: { prefix: string, currentURI: string }) {
  return (
    <aside
      className="flex flex-col gap-2 bg-light-neutral p-10 rounded-xl underline underline-offset-2 text-light-text"
    >
      <a
        className={"hover:text-primary-hover transition-all" +
          (!currentURI && " text-primary-hover")}
        href={prefix}>0. Introduccion</a
      >
      {
        TERMS_PAGES.map(({ id, term, title, content }) => (
          <a
            key={`${term}`}
            href={`${prefix}${term}`}
            className={
              "hover:text-primary-hover transition-all" +
              (currentURI === term && " text-primary-hover")
            }
          >
            {id}. {title}
          </a>
        ))
      }
    </aside>
  )
}
