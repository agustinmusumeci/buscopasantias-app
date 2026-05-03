import { actions } from "astro:actions";
import { useState, useRef } from "react";
import { UNIVERSITIES_CAREERS } from "@/constants/universitiesCareers";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import Warning from "../ui/warning";
import { ArrowUpRight, BellRing, CheckCheck, CircleDollarSign, CirclePlusIcon, CircleX, House, Info, KeyRound, LoaderIcon, UniversityIcon } from "lucide-react";
import alertasNotFound from "../../../public/images/alertas-notfound.png";
import PageTitle from "../ui/page-title";
import Careers from "../career/careers";

export default function Alert({ user, internships = [] }: { user: any; internships: any[] }) {
  // Parse all the careers and suscripted careers

  const careers = UNIVERSITIES_CAREERS.flatMap((u) => u.careers);
  const userCareersIds = new Set(user ? user?.careers?.map((c: { id: string }) => c?.id) : []);

  const [suscripted, setSuscripted] = useState(user?.suscripted ?? false);

  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [alertedInternships, setAlertedInternships] = useState(internships ?? []);
  const [availableCareers, setAvailableCareers] = useState(careers.filter((career) => !userCareersIds.has(career?.id)) ?? []);

  const [suscriptedCareers, setSuscriptedCareers] = useState(user?.careers ?? []);
  const [toDeleteCareers, setToDeleteCareers] = useState<Array<{ id: string; name: string; color: string; bg: string }>>([]);
  const [suscriptedKeywords, setSuscriptedKeywords] = useState(user?.keywords ?? []);
  const [toDeleteKeywords, setToDeleteKeywords] = useState<Array<string>>([]);

  const [keyword, setKeyword] = useState("");

  const [openDialog, setOpenDialog] = useState(false);

  const [loading, setLoading] = useState(false);

  const debouncerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSuscription = async () => {
    if (debouncerRef.current) {
      clearTimeout(debouncerRef.current);
    }

    debouncerRef.current = setTimeout(async () => {
      const newSuscription = !suscripted;

      const { data, error } = await actions.suscribeUser({
        id: user?.id,
        suscription: newSuscription,
      });

      if (error) {
        console.error(error);

        toast.error(error.message, {
          action: {
            label: "X",
            onClick: () => console.log("Cerrando toast"),
          },
        });

        return;
      }

      setSuscripted(newSuscription);
    }, 500);
  };

  const handleSumbit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const [{ data: careersData, error: careersError }, { data: keywordsData, error: keywordsError }] = await Promise.all([
      actions.suscribeCareers({
        id: user?.id,
        toSuscribeCareers: suscriptedCareers.map((c: { id: string }) => c?.id),
        toDeleteCareers: toDeleteCareers.map((c: { id: string }) => c?.id),
      }),
      actions.suscribeKeywords({ id: user?.id, toSuscribeKeywords: suscriptedKeywords, toDeleteKeywords: toDeleteKeywords }),
    ]);

    if (careersError) {
      toast.error(careersError.message, {
        action: {
          label: "X",
          onClick: () => console.log("Cerrando toast"),
        },
      });

      console.error(careersError);
    } else {
      toast.success(careersData.message, {
        action: {
          label: "X",
          onClick: () => console.log("Cerrando toast"),
        },
      });
    }

    if (keywordsError) {
      toast.error(keywordsError.message, {
        action: {
          label: "X",
          onClick: () => console.log("Cerrando toast"),
        },
      });

      console.error(keywordsError);
    } else {
      toast.success(keywordsData.message, {
        action: {
          label: "X",
          onClick: () => console.log("Cerrando toast"),
        },
      });
    }

    setLoading(false);
  };

  const handleDiscardChanges = async () => {
    setSuscriptedCareers(user?.careers ?? []);
    setSuscriptedKeywords(user?.keywords ?? []);
    setToDeleteCareers([]);
    setToDeleteKeywords([]);
  };

  const suscriptCareer = (careerId: string, suscript: boolean) => {
    const career = careers.find((c) => c.id === careerId);
    if (!career) return;

    if (suscript) {
      setSuscriptedCareers([...suscriptedCareers, career]);
      setAvailableCareers(availableCareers.filter((c) => c.id !== careerId));
    } else {
      setSuscriptedCareers(suscriptedCareers.filter((c: { id: string }) => c.id !== careerId));
      setAvailableCareers([...availableCareers, career]);
      setToDeleteCareers([...toDeleteCareers, career]);
    }
  };

  const suscriptKeyword = (keyword: string, suscript: boolean) => {
    if (suscript) {
      if (!suscriptedKeywords.includes(keyword) && keyword) {
        setSuscriptedKeywords([...suscriptedKeywords, keyword]);
        setToDeleteKeywords((prev) => [...prev.filter((el) => el !== keyword)]);
        setKeyword("");
      }
    } else {
      if (!toDeleteKeywords.includes(keyword) && keyword) {
        setToDeleteKeywords([...toDeleteKeywords, keyword]);
        setSuscriptedKeywords((prev: Array<string>) => [...prev.filter((el) => el !== keyword)]);
      }
    }
  };

  const handleMarkAlertsAsRead = async () => {
    const internshipsIds = internships.map((internship) => internship.internship.id);

    const { data, error } = await actions.markAlertAsRead({
      id: user?.id,
      internships: internshipsIds,
    });

    if (data && data?.length > 0) {
      console.log(alertedInternships);
      setAlertedInternships(alertedInternships.filter((internship) => !data.includes(internship.internship.id)));
    }
  };

  return (
    <section>
      {user ? (
        <div className="flex flex-col gap-5">
          <form className="mb-5">
            <div className="bg-light-neutral w-fit flex flex-row gap-10 items-center p-5 rounded-xl">
              <div>
                <p className="font-bold">Alertas</p>
                <span className="text-text/75">
                  ESTADO: <span className="text-primary-hover">{suscripted ? "ACTIVO" : "NO ACTIVO"}</span>
                </span>
              </div>

              <AlertDialog open={openDialog}>
                <AlertDialogTrigger asChild>
                  <div
                    className="switch"
                    aria-checked={suscripted}
                    onClick={() => {
                      if (suscripted) {
                        handleSuscription();
                      } else {
                        setOpenDialog(true);
                      }
                    }}
                  >
                    <div
                      className="switch-button"
                      aria-checked={suscripted}
                    />
                    <span className="switch-slider round"></span>
                  </div>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-light-neutral text-text border-0!">
                  <AlertDialogHeader>
                    <p className="font-bold">Activar alertas</p>
                    <AlertDialogDescription className="flex flex-col gap-5">
                      <div className="text-left">Esta acción utilizara tus datos para notificarte según preferencias.</div>
                      <div className="flex flex-row gap-2 items-center">
                        <input
                          id="terms"
                          type="checkbox"
                          className="border-px border-text/50!"
                          onClick={() => setAcceptedTerms(!acceptedTerms)}
                        />
                        <label htmlFor="terms">
                          Acepto los{" "}
                          <a
                            className="font-text! underline"
                            href="/terminos-y-condiciones"
                            target="_blank"
                          >
                            términos y condiciones
                          </a>
                        </label>
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex flex-row">
                    <AlertDialogCancel
                      onClick={() => {
                        setAcceptedTerms(false);
                        setOpenDialog(false);
                      }}
                      className="button button-outline rounded-full! cursor-pointer"
                    >
                      Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                      disabled={!acceptedTerms}
                      className="button button-primary rounded-full! cursor-pointer"
                      onClick={() => {
                        setOpenDialog(false);

                        setAcceptedTerms(false);
                        handleSuscription();
                      }}
                    >
                      Aceptar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </form>
          <div className="bg-light-neutral/50 h-105 md:h-95 w-full mb-0 p-8 rounded-xl">
            <div className="title-md flex flex-row  items-center">
              <div className="flex flex-col-reverse md:flex-row justify-between gap-4 items-start md:items-center w-full">
                <button
                  disabled={alertedInternships.length === 0}
                  aria-disabled={alertedInternships.length === 0}
                  onClick={handleMarkAlertsAsRead}
                  className="button button-primary text-sm font-normal cursor-pointer"
                >
                  Marca como leidas <CheckCheck />
                </button>
                <div>
                  <span className="text-3xl">{alertedInternships?.length}</span> <span className="text-xl font-normal">Pasantías nuevas</span>
                </div>
              </div>
            </div>
            <div className="h-65 flex flex-row gap-5 horizontal-scroll md:mt-6">
              {alertedInternships?.map((internship) => (
                <div
                  key={internship.internship.id}
                  className="relative flex flex-col gap-5 bg-light-neutral text-text/75 p-5 min-w-100 h-65 rounded-xl"
                >
                  <div>
                    <a
                      href={`/pasantias/${internship.internship.id}`}
                      className="relative flex flex-row justify-between items-start gap-10 hover:underline hover:text-primary-hover transition-all mt-5"
                    >
                      <div className="flex flex-row gap-5 items-center overflow-hidden w-full grow">
                        <div className="w-1 h-1 p-1 rounded-full bg-primary-hover"></div>
                        <h4 className="font-semibold text-lg truncate line-clamp-1">{internship.internship.position}</h4>
                      </div>
                      <ArrowUpRight className="w-fit h-7" />
                    </a>
                  </div>
                  <div className="flex flex-col gap-2 mb-9">
                    <p className="flex flex-row gap-2 items-center">
                      <House className="text-text/50 w-4" />
                      {internship.internship.company.name}
                    </p>
                    <p className="flex flex-row gap-2 items-center">
                      <CircleDollarSign className="text-text/50 w-4" />
                      {typeof internship?.internship?.payment === "number" ? `$${internship?.internship?.payment?.toLocaleString()}` : internship.internship.payment}
                    </p>
                  </div>
                  <div>
                    <div className="flex flex-row gap-3"></div>
                    <div className="pt-2 relative flex flex-row gap-20 justify-between items-center before:absolute before:-top-1/2 before:h-px before:w-full before:bg-text/20">
                      <span
                        className="text-sm opacity-75 shrink-0"
                        style={{ color: `${internship.internship.timeSinceCreated.color}` }}
                      >
                        {internship.internship.timeSinceCreated.time}
                      </span>
                      <div className="flex flex-row items-center gap-2 overflow-hidden">
                        <Careers
                          careers={internship.internship.careers}
                          isCard={true}
                        />
                      </div>
                    </div>
                    <span>
                      <a
                        className="flex flex-row gap-5 text-primary-hover/50 hover:underline cursor-pointer"
                        href={`/pasantias/${internship.internship.id}`}
                      ></a>
                    </span>
                  </div>
                </div>
              ))}
              {alertedInternships?.length === 0 && (
                <div className="flex flex-col md:flex-row md:gap-10 items-start md:items-center justify-center h-fit md:h-65">
                  <div className="">
                    <img
                      src={alertasNotFound.src}
                      alt="Sin alertas"
                      loading="lazy"
                      className="w-30 md:w-65"
                    />
                    <p className="title-lg md:hidden">Estas al día</p>
                  </div>
                  <div className="w-full">
                    <p className="title-lg hidden md:inline-block">Estas al día</p>
                    <p className="text-text/50">No hay nuevas pasantías aún. ¡Te notificaremos si se registran nuevas!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div>
            <div className="mt-10">
              <PageTitle
                title="Configuración"
                description="Customiza parámetros para tener alertas personalizadas según tus preferencias."
              />
            </div>
            <div className="flex flex-col gap-5">
              <div>
                <div>
                  <h3 className="title-md">Carreras</h3>
                </div>
                <div
                  className="grid grid-cols-1 md:grid-cols-2 place-content-start gap-5 min-h-100"
                  aria-disabled={!suscripted}
                >
                  {/* Available careers */}
                  <div className="flex flex-col gap-2 min-h-100 bg-light-neutral/50 rounded-xl p-8">
                    <div className="title-sm flex flex-row gap-4 items-center">
                      <UniversityIcon />

                      <h4>Disponibles</h4>
                    </div>
                    <ScrollArea className="h-70">
                      {availableCareers.map((career) => (
                        <button
                          onClick={() => {
                            suscriptCareer(career.id, true);
                          }}
                          disabled={!suscripted}
                          key={`available-careers-${career?.id}`}
                          aria-disabled={!suscripted}
                          className="w-full mb-2 group flex flex-row gap-3 justify-between odd:bg-light-neutral even:bg-light-neutral/30 hover:bg-neutral transition-all items-center px-5 py-4 rounded-lg cursor-pointer"
                          style={{ color: `${career.color}` }}
                        >
                          <span>{career.name}</span>
                          <span className="text-xl text-text/20 group-hover:text-primary-hover transition-all">
                            <CirclePlusIcon />
                          </span>
                        </button>
                      ))}
                    </ScrollArea>
                  </div>

                  {/* Suscripted careers */}
                  <div className="flex flex-col gap-2 min-h-100 bg-light-neutral/50 rounded-xl p-8">
                    <div className="title-sm flex flex-row gap-4 items-center">
                      <BellRing
                        aria-disabled={!suscripted}
                        className="text-primary-hover  disabled:text-text/50  aria-disabled:text-text/50"
                      />

                      <h4>Suscriptas</h4>
                    </div>
                    <ScrollArea className="flex flex-col gap-2 h-70">
                      {suscriptedCareers.map((career: { id: string; color: string; name: string; bg: string }) => (
                        <button
                          aria-disabled={!suscripted}
                          onClick={() => {
                            suscriptCareer(career.id, false);
                          }}
                          key={`suscripted-careers-${career?.id}`}
                          className="w-full mb-2 group flex flex-row gap-3 justify-between bg-[#292929]/50  hover:bg-neutral transition-all items-center px-5 py-4 rounded-lg cursor-pointer relative before:absolute before:h-full before:w-1 before:bg-primary before:left-0 before:rounded-bl-full before:rounded-tl-full"
                        >
                          <span style={{ color: `${career.color}` }}>{career.name}</span>
                          <span className="text-xl text-text/20 group-hover:text-red-800 transition-all">
                            <CircleX />
                          </span>
                        </button>
                      ))}
                      {suscriptedCareers.length === 0 && (
                        <span className="group flex flex-row gap-3 justify-between odd:bg-neutral items-center px-5 py-4 rounded-lg cursor-pointer border-text/20 border-2 border-dotted">
                          <span className="flex flex-row gap-5 text-xl text-text/40 items-center">
                            <CirclePlusIcon />
                            Seleccione carreras para alertar
                          </span>
                        </span>
                      )}
                    </ScrollArea>
                  </div>
                </div>
              </div>
              <div className="mt-5">
                <div>
                  <h3 className="title-md">Filtros</h3>
                </div>
                <div className="bg-light-neutral/50 h-fit md:h-fit w-full rounded-xl p-8">
                  <div className="flex flex-col gap-2 h-fit">
                    <div className="title-sm flex flex-row gap-4 items-center">
                      <KeyRound />

                      <h4>Palabras clave</h4>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-end gap-5">
                      <div className="flex flex-col gap-2">
                        <label
                          htmlFor="keyword"
                          aria-disabled={!suscripted}
                        >
                          Nueva palabra
                        </label>
                        <input
                          aria-disabled={!suscripted}
                          value={keyword}
                          onChange={(e) => {
                            setKeyword(e.target.value);
                          }}
                          id="keyword"
                          name="keyword"
                          type="text"
                          maxLength={30}
                        />
                      </div>
                      <button
                        className="button button-outline h-fit"
                        type="button"
                        aria-disabled={!suscripted}
                        onClick={() => {
                          suscriptKeyword(keyword, true);
                        }}
                      >
                        Añadir
                        <CirclePlusIcon />
                      </button>
                    </div>
                    {/* Current keywords */}
                    <div className="h-fit mt-8">
                      <div className="flex flex-row flex-wrap gap-5">
                        {suscriptedKeywords.map((k: string, i: number) => (
                          <button
                            aria-disabled={!suscripted}
                            onClick={() => {
                              suscriptKeyword(k, false);
                            }}
                            className="flex flex-row items-center justify-between gap-5 bg-light-neutral group px-5 py-2 hover:bg-neutral transition-all rounded-full text-text"
                            key={`keywords-${k}-${i}`}
                          >
                            <p className="text-start mr-10">{k}</p>
                            <CircleX className=" text-text/40 transition-all" />
                          </button>
                        ))}
                      </div>

                      {suscriptedKeywords?.length === 0 && (
                        <span className="group flex flex-row gap-3 justify-between odd:bg-neutral items-center px-5 py-4 rounded-lg cursor-pointer border-text/20 border-2 border-dotted">
                          <span className="flex flex-row gap-5 text-xl text-text/40 items-center">
                            <CirclePlusIcon />
                            Agregue palabras clave
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="my-20 relative before:absolute before:w-full before:-top-10 before:h-px before:bg-light-text/10 flex flex-col gap-10 lg:flex-row justify-between">
                <form
                  className="flex flex-row gap-5"
                  onSubmit={handleSumbit}
                >
                  <button
                    type="submit"
                    aria-disabled={loading || !suscripted}
                    disabled={loading || !suscripted}
                    className="button button-primary min-w-fit h-fit px-3 py-2 border border-gray-200 cursor-pointer rounded-full"
                  >
                    {loading && <LoaderIcon className="animate-spin" />}
                    Guardar configuración
                  </button>
                  <button
                    type="button"
                    aria-disabled={loading || !suscripted}
                    disabled={loading || !suscripted}
                    className="button button-outline h-fit px-3 py-2 border border-gray-200 cursor-pointer rounded-full"
                    onClick={handleDiscardChanges}
                  >
                    Descartar
                  </button>
                </form>
                <div className="flex flex-row items-center text-light-text/50 font-light">
                  <p className="max-w-prose flex flex-row items-start gap-5">
                    <Info className="w-20" />
                    Los cambios se aplicaran al instante a su configuración de alertas. Las pasantías al coincidir con alguno de parámtros generaran un mail que se enviara a su dirección.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <Warning title="Necesitas iniciar sesión para activar las notificaciones" />
        </div>
      )}
    </section>
  );
}
