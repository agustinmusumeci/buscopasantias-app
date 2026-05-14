import { ListFilter } from "lucide-react";
import { UNIVERSITIES_CAREERS } from "@/constants/universitiesCareers";
import { useEffect, useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useDesktopResolution } from "@/hooks/useResolution";
import SuscribeAlert from "../alert/suscribe";

export default function Filter({ filter, isAuthenticated, loggedUser, hasNotifications }) {
  const [form, setForm] = useState(filter);
  const isDesktop = useDesktopResolution({ resolution: 1024 });

  const onChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onCareerToggle = (careerId) => {
    setForm((prev) => {
      const isCareerSelected = prev.careers.includes(careerId);

      return {
        ...prev,
        careers: isCareerSelected ? prev.careers.filter((c) => c !== careerId) : [...prev.careers?.filter((c) => c !== "*"), careerId],
      };
    });
  };

  useEffect(() => {
    const url = new URL(window.location);

    const { careers, universities, ...rest } = form;

    Object.entries(rest).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value);
      } else {
        url.searchParams.delete(key);
      }
    });

    if (careers.length > 0) {
      url.searchParams.set("careers", careers.join(","));
    } else {
      url.searchParams.delete("careers");
    }

    if (universities.length > 0) {
      url.searchParams.set("universities", universities.join(","));
    } else {
      url.searchParams.delete("universities");
    }

    window.history.replaceState({}, "", url);
  }, [form]);

  return (
    <div className="flex flex-col gap-5 mt-5 mx-2 lg:col-span-1 col-span-full">
      <div className="mb-5">
        <SuscribeAlert
          careers={form?.careers.length === 0 || form?.careers.includes("*") ? [] : form?.careers}
          keyword={form?.text ?? ""}
          isAuthenticated={isAuthenticated}
          loggedUser={loggedUser}
          hasNotifications={hasNotifications}
        />
      </div>

      <div>
        <Accordion
          type="single"
          collapsible
          {...(isDesktop && { defaultValue: "filter" })}
        >
          <AccordionItem value="filter">
            <AccordionTrigger className="max-md:**:data-[slot=accordion-trigger-icon]:hidden">
              <div className="mb-0 text-lg font-medium flex flex-row gap-5 items-center border border-text rounded-full px-5 py-2 md:button md:button-outline md:px-0 md:py-0 md:border-none">
                <ListFilter />
                <p>Filtros</p>
              </div>
            </AccordionTrigger>
            <AccordionContent value="filter">
              <form
                className="flex flex-col gap-5"
                id="internships-filter"
                method="get"
              >
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2 w-full">
                    <label htmlFor="page" />
                    <input
                      name="page"
                      id="page"
                      type="hidden"
                    />

                    <label
                      htmlFor="text"
                      className="text-text/50"
                    >
                      Buscar
                    </label>
                    <input
                      className="border"
                      name="text"
                      id="text"
                      type="text"
                      placeholder="Id, palabra clave..."
                      value={form?.text}
                      onInput={onChange}
                    />
                  </div>
                  <div className="flex flex-col gap-0 w-full">
                    <label
                      htmlFor="careers"
                      className="text-text/50"
                    >
                      Universidades
                    </label>
                    <div>
                      <input
                        type="hidden"
                        name="careers"
                        value={form?.careers?.length > 0 ? form?.careers?.join(",") : "*"}
                      />
                      {UNIVERSITIES_CAREERS?.map(
                        (u) =>
                          u?.careers?.length > 0 && (
                            <Accordion
                              type="single"
                              collapsible
                              defaultValue={`${u.id}`}
                              key={u.id}
                            >
                              <AccordionItem value={`${u.id}`}>
                                <AccordionTrigger className="text-sm font-thin">{u.name}</AccordionTrigger>
                                <AccordionContent>
                                  <div className="flex flex-col gap-2">
                                    {u.careers.map((c) => (
                                      <div
                                        className="flex flex-row items-center gap-2 font-light"
                                        key={c.id}
                                      >
                                        <input
                                          type="checkbox"
                                          value={c.id}
                                          checked={form?.careers?.includes(c.id)}
                                          onChange={() => onCareerToggle(c.id)}
                                        />
                                        <label
                                          key={`filter-${c.id}`}
                                          className="flex items-center gap-1 cursor-pointer text-text"
                                        >
                                          {c.name}
                                        </label>
                                      </div>
                                    ))}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          ),
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 w-full">
                    <label
                      htmlFor="date"
                      className="text-text/50"
                    >
                      Fecha
                    </label>
                    <select
                      className="border-text"
                      name="date"
                      id="date"
                      value={form?.date}
                      onChange={onChange}
                    >
                      <option value="*">Cualquiera</option>
                      <option value="1">Hace 24hs</option>
                      <option value="7">Hace 1 semana</option>
                      <option value="14">Hace 2 semanas</option>
                      <option value="30">Hace 1 mes</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2 w-full">
                    <label
                      htmlFor="time"
                      className="text-text/50"
                    >
                      Tiempo
                    </label>
                    <select
                      className=""
                      name="time"
                      id="time"
                      value={form?.time}
                      onChange={onChange}
                    >
                      <option value="DESC">Mas reciente - Mas antigua</option>
                      <option value="ASC">Mas antigua - Mas reciente</option>
                    </select>
                  </div>
                </div>
                <div>
                  <button
                    className=" mt-2 button button-primary w-full! inline!"
                    type="submit"
                  >
                    Filtrar
                  </button>
                </div>
              </form>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
