import { FastifyReply, FastifyRequest } from "fastify";

export default async function checkSessionIdExist(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { session_id } = request.cookies;

  if (!session_id) {
    return reply.status(401).send({
      error: "Session ID not found",
    });
  }
}
