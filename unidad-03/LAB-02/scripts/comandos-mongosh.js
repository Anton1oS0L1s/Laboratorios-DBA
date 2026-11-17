function bitacora() {
  return db.adminCommand({ getLog: "global" }).log.map(l => JSON.parse(l));
}

// Actividad 1 - Verificar version, edicion y ausencia de auditoria nativa
db = db.getSiblingDB("admin");
db.auth("admin", "Admin_Practica_2026");

db.version();
db.runCommand({ buildInfo: 1 }).modules;
db.adminCommand({ getParameter: 1, auditLog: 1 });

// Actividad 2 - Incidente sin perfilado activo
db = db.getSiblingDB("comercial");
db.getProfilingStatus();
db.system.profile.countDocuments();
bitacora().filter(e => e.c === "ACCESS" || e.c === "NETWORK").slice(-5);

// Actividad 3 - Activar el perfilador en nivel 2 y registrar operaciones
db = db.getSiblingDB("comercial");
db.setProfilingLevel(2);
db.getProfilingStatus();

// Consultar operaciones registradas en system.profile sobre comercial.clientes
db.system.profile.find(
  { ns: "comercial.clientes" },
  { op: 1, ns: 1, command: 1, user: 1, client: 1, appName: 1, ts: 1, millis: 1, nreturned: 1, docsExamined: 1, nModified: 1, ndeleted: 1 }
).sort({ ts: 1 });

// Actividad 4 - Reducir el volumen con un filtro de operaciones de escritura
db = db.getSiblingDB("comercial");
db.setProfilingLevel(0);
db.system.profile.drop();
db.setProfilingLevel(1, { filter: { op: { $in: ["insert", "update", "remove"] } } });
db.getProfilingStatus();

// Verificar que solo se capturan modificaciones y no lecturas
db.system.profile.find(
  {},
  { op: 1, ns: 1, user: 1, appName: 1, "command.q": 1, "command.u": 1, ts: 1 }
);

// Actividad 5 - Accesos fallidos y exitosos en la bitacora de mongod
bitacora()
  .filter(e => e.c === "ACCESS" && e.msg === "Failed to authenticate")
  .map(e => ({
    t: e.t,
    id: e.id,
    ctx: e.ctx,
    user: e.attr.user,
    client: e.attr.client,
    error: e.attr.error,
    result: e.attr.result,
    app: e.attr.doc?.application?.name
  }));

bitacora()
  .filter(e => e.msg === "Successfully authenticated" && e.attr.user === "app_ventas")
  .slice(-1)
  .map(e => ({
    t: e.t,
    id: e.id,
    ctx: e.ctx,
    client: e.attr.client,
    result: e.attr.result,
    app: e.attr.doc?.application?.name
  }));

// Actividad 6 - Correlacionar cambio de configuracion con su autor
bitacora()
  .filter(e => e.msg === "Profiler settings changed")
  .map(e => ({ t: e.t, ctx: e.ctx, msg: e.msg, attr: e.attr }));

// Sustituir conn31 por el identificador ctx obtenido en la consulta anterior
bitacora()
  .filter(e => e.ctx === "conn31" && e.msg === "Successfully authenticated")
  .map(e => ({ t: e.t, ctx: e.ctx, user: e.attr.user, db: e.attr.db, client: e.attr.client }));

// Actividad 7 - Cambios de privilegios y control compensatorio con instantaneas
db = db.getSiblingDB("comercial");

// Primera instantanea antes de otorgar privilegios
db.getSiblingDB("auditoria").instantaneas_privilegios.insertOne({
  momento: new Date(),
  tomada_por: db.runCommand({ connectionStatus: 1 }).authInfo.authenticatedUsers,
  usuarios: (db.getUsers().users ?? db.getUsers()).map(u => ({ user: u.user, db: u.db, roles: u.roles }))
});

// Activar nivel 2 y otorgar rol temporal a la cuenta de aplicacion
db.setProfilingLevel(2);
db.grantRolesToUser("app_ventas", [{ role: "dbAdmin", db: "comercial" }]);

// Confirmar ausencia de rastro nativo en system.profile y bitacora
db.system.profile.countDocuments({ "command.grantRolesToUser": { $exists: true } });
bitacora().filter(e => JSON.stringify(e).includes("grantRoles")).length;

// Segunda instantanea despues de otorgar el rol
db.getSiblingDB("auditoria").instantaneas_privilegios.insertOne({
  momento: new Date(),
  tomada_por: db.runCommand({ connectionStatus: 1 }).authInfo.authenticatedUsers,
  usuarios: (db.getUsers().users ?? db.getUsers()).map(u => ({ user: u.user, db: u.db, roles: u.roles }))
});

// Comparar las instantaneas almacenadas
db.getSiblingDB("auditoria").instantaneas_privilegios.find({}, { _id: 0 }).sort({ momento: 1 });

// Revocar rol temporal y restablecer filtro de escritura
db.revokeRolesFromUser("app_ventas", [{ role: "dbAdmin", db: "comercial" }]);
db.setProfilingLevel(1, { filter: { op: { $in: ["insert", "update", "remove"] } } });

// Actividad 8 - Verificacion de persistencia tras reinicio del servicio
db = db.getSiblingDB("comercial");
db.getProfilingStatus();
db.system.profile.countDocuments();
bitacora().length;