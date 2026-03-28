using System.Data;
using System.Reflection;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Logging.Abstractions;

namespace prj_backend_eval_desempenno.AccesoDatos;

public class daSQL
{
    private readonly string? cadenaConexion;
    private readonly string? archivoLog;
    private readonly ILogger<daSQL> _logger;

    public daSQL(IConfiguration configura, string nombreConexion, ILogger<daSQL>? logger = null)
    {
        _logger = logger ?? NullLogger<daSQL>.Instance;
        cadenaConexion = configura.GetConnectionString(nombreConexion);
        if (string.IsNullOrEmpty(cadenaConexion))
        {
            cadenaConexion = Environment.GetEnvironmentVariable(nombreConexion);
        }
        archivoLog = configura.GetSection("AppSettings")["ArchivoLog"];
    }

    public string ejecutarComando(string nombreSP, string parNombre = "", string parValor = "")
    {
        string rpta = "";
        using (SqlConnection con = new SqlConnection(cadenaConexion))
        {
            try
            {
                con.Open();
                SqlCommand cmd = new SqlCommand(nombreSP, con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 180;

                if (!string.IsNullOrEmpty(parNombre))
                    cmd.Parameters.AddWithValue(parNombre, parValor);

                object? data = cmd.ExecuteScalar();

                if (data != null)
                    rpta = data.ToString()!;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error en backend: {StoredProcedure}", nombreSP);
                return "error";
            }
        }
        return rpta;
    }

    public List<T> ejecutarComandoLista<T>(string nombreSP, string parNombre = "", string parValor = "") where T : class, new()
    {
        List<T> lista = new();
        using (SqlConnection con = new SqlConnection(cadenaConexion))
        {
            try
            {
                con.Open();
                using (SqlCommand cmd = new SqlCommand(nombreSP, con))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.CommandTimeout = 180;

                    if (!string.IsNullOrEmpty(parNombre))
                        cmd.Parameters.AddWithValue(parNombre, parValor);

                    using (SqlDataReader reader = cmd.ExecuteReader())
                    {
                        int nroReg = reader.FieldCount;
                        while (reader.Read())
                        {
                            T entidad = new();
                            for (int i = 0; i < nroReg; i++)
                            {
                                var propiedad = typeof(T).GetProperty(reader.GetName(i), BindingFlags.Public | BindingFlags.Instance | BindingFlags.IgnoreCase);
                                if (propiedad != null && propiedad.CanWrite && !reader.IsDBNull(i))
                                {
                                    propiedad.SetValue(entidad, Convert.ChangeType(reader.GetValue(i), propiedad.PropertyType));
                                }
                            }
                            lista.Add(entidad);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error en backend: {StoredProcedure}", nombreSP);
                return lista;
            }
        }
        return lista;
    }
}
