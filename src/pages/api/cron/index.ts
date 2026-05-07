import { CronController } from "../../../controllers/cron.controller";
import dotenv from "dotenv";
dotenv.config({ path: "/.env" });

export async function GET({ params, request }: { params: Record<string, string>; request: Request }) {
  // Bearer Token check
  if (request.headers.get("Authorization") !== `Bearer ${import.meta.env.CRON_SECRET}`) {
    return new Response(null, {
      status: 401,
      statusText: "Unauthorized",
    });
  }

  const cronController = new CronController();

  const { ok, error } = await cronController
    .getInternships()
    .then(() => {
      return { ok: true, error: null };
    })
    .catch((e) => {
      return { ok: false, error: e };
    });

  if (ok && !error) {
    return new Response(
      JSON.stringify({
        message: "Internships obtained successfuly",
        success: true,
      }),
    );
  } else {
    console.error("Cron error: ", error);
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
      statusText: "Internal server error",
    });
  }
}
