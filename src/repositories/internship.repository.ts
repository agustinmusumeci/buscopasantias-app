import type { InternshipWhereUniqueInput } from "prisma/generated/models";
import type { Internship } from "../../prisma/zod";
import { INTERNSHIPS_PER_PAGE } from "../constants/paginations";
import prisma from "../lib/prisma";
import { UTNScraper } from "@/services/utn.scraper.service";

export class InternshipRepository {
  constructor() {}

  async scrapeInternships(): Promise<Array<Internship & { careers: Array<string> }>> {
    // Scrapers available
    const UTN_SCRAPER = new UTNScraper();

    const scrapers = [UTN_SCRAPER];

    const internships: Array<Internship & { careers: Array<string> }> = [];

    for (let scraper of scrapers) {
      const data = (await scraper.scrapeInternships()).map((el) => ({ ...el, university_id: scraper.getUniversity() }));

      internships.push(...data);
    }

    return internships;
  }

  async getInternships(filter?: { careers: Array<string> | undefined; text?: string; time?: string; date?: string; page: number }) {
    let where = {} as { OR: Array<any>; internshipCareers: any; created_at: any };
    let order = {};

    if (filter?.text) {
      where["OR"] = [
        { knowledge: { contains: filter.text, mode: "insensitive" } },
        { modality: { contains: filter.text, mode: "insensitive" } },
        { position: { contains: filter.text, mode: "insensitive" } },
        { requirements: { contains: filter.text, mode: "insensitive" } },
      ];
    }

    if (filter?.careers && filter?.careers?.length > 0 && !filter?.careers.includes("*")) {
      where["internshipCareers"] = {
        some: {
          career_id: {
            in: filter?.careers,
          },
        },
      };
    }

    if (filter?.time) {
      order = {
        created_at: filter?.time?.toLocaleLowerCase(),
      };
    } else {
      order = {
        created_at: "desc",
      };
    }

    if (filter?.date && filter?.date !== "*") {
      const currentDate = new Date();

      const dateToFilter = new Date(currentDate.getTime() - Number(filter?.date) * 24 * 60 * 60 * 1000);

      where["created_at"] = { gte: dateToFilter };
    }

    const count = await prisma.internship.count({
      where: where,
      orderBy: order,
    });

    const response = await prisma.internship.findMany({
      where: where,
      orderBy: order,
      take: INTERNSHIPS_PER_PAGE,
      skip: (filter?.page ?? 0) * INTERNSHIPS_PER_PAGE,
      include: {
        Company: true,
        University: true,
        internshipCareers: {
          include: {
            Career: true,
          },
        },
      },
    });

    return { data: response, count: count };
  }

  async getInternship(id: number | undefined = undefined, arm: string = "") {
    let where = {} as InternshipWhereUniqueInput;
    if (id) {
      where["id"] = id;
    }

    if (arm) {
      where["arm"] = arm;
    }

    return await prisma.internship.findFirst({
      where: where,
      include: {
        Company: true,
        University: true,
        internshipCareers: {
          include: {
            Career: true,
          },
        },
      },
    });
  }

  async uploadInternships(
    internships: Array<
      Internship & {
        careers: Array<string>;
      }
    >,
  ) {
    try {
      const updatedInternships = await prisma.$transaction(async (tx) => {
        // Select all the internships that already exists before the upload
        const preExisting = await tx.internship.findMany({
          where: {
            arm: { in: internships.map((i) => i["arm"]) },
          },
          select: { ["arm"]: true },
        });

        const preExistingARMS = new Set(preExisting.map((r) => r["arm"]));

        // Create the internships and skip if already exists
        await tx.internship.createMany({
          data: internships.map(({ careers, ...rest }) => rest),
          skipDuplicates: true,
        });

        // Select only the ones that were created on the past hour
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

        const created = await tx.internship.findMany({
          where: { arm: { notIn: Array.from(preExistingARMS) }, created_at: { gte: oneHourAgo } },
        });

        // Create relation between internships and careers
        const internshipCareerData = created.flatMap((internship) => {
          const original = internships.find((i) => i.arm === internship.arm);
          return (
            original?.careers?.map((career_id) => ({
              internship_id: internship.id,
              career_id,
            })) ?? []
          );
        });

        await tx.internshipCareer.createMany({
          data: internshipCareerData,
          skipDuplicates: true,
        });

        // Associate the created internships with its careers
        const careersHash: Record<string, Array<string>> = {};

        for (let internship of internships) {
          careersHash[internship.arm] = internship?.careers;
        }

        const updatedInternships = created.map((i) => ({
          ...i,
          careers: careersHash[i.arm] ?? [],
        }));

        return updatedInternships;
      });
      return updatedInternships;
    } catch (e) {
      console.log(e);
      return [];
    }
  }
}
