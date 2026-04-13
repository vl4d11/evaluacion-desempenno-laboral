using Microsoft.AspNetCore.Mvc;
using prj_backend_eval_desempenno.AccesoDatos;

namespace prj_backend_eval_desempenno.Controllers;

[ApiController]
[Route("llamada/fetch")]
public class FetchController : Controller
{

    private readonly ILogger<FetchController> _logger;
    private readonly IConfiguration _configuration;
    private readonly IHttpClientFactory _httpClientFactory;

    public FetchController(ILogger<FetchController> logger, IConfiguration configuration, IHttpClientFactory httpClientFactory)
    {
        _logger = logger;
        _configuration = configuration;
        _httpClientFactory = httpClientFactory;
    }

    [HttpPost("acceso")]
    public string TraerDatosIniciales()
    {
        try
        {
            string rpta = "";
            string user = Request.Form["data1"].ToString();
            string clave = Request.Form["data2"].ToString();
            string usuario = $"{user}|{clave}";

            daSQL odaSQL = new daSQL(_configuration, "CNX");
            rpta = odaSQL.ejecutarComando("dbo.usp_login_eva_desempenno", "@data", usuario);
            if (rpta == "")
            {
                _logger.LogError("dbo.usp_login_eva_desempenno '{data}'", usuario);
                rpta = "error";
            }
            return rpta;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al guardar la data...");
            return "error";
        }
    }

    [HttpGet("listaCompetencias")]
    public string TraerListaCompetencias()
    {
        try
        {
            string rpta = "";
            daSQL odaSQL = new daSQL(_configuration, "CNX");
            rpta = odaSQL.ejecutarComando("dbo.usp_listar_competencias");
            return rpta;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al recuperar la data...");
            return "error";
        }
    }

    [HttpPost("mante_competencia")]
    public string TraerDatoLote()
    {
        try
        {
            string rpta = "";
            string data = Request.Form["data"].ToString();

            daSQL odaSQL = new daSQL(_configuration, "CNX");
            rpta = odaSQL.ejecutarComando("dbo.usp_mantenimiento_competencias_simple", "@data", data);
            if (rpta == "")
            {
                _logger.LogError("dbo.usp_mantenimiento_competencias_simple '{data}'", data);
                rpta = "error";
            }
            return rpta;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al guardar la data...");
            return "error";
        }
    }

    [HttpGet("listaFormatoEv")]
    public string TraerListaFormatosEvaluacion()
    {
        try
        {
            string rpta = "";
            daSQL odaSQL = new daSQL(_configuration, "CNX");
            rpta = odaSQL.ejecutarComando("dbo.usp_listar_formato_evaluacionDesem");
            return rpta;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al recuperar la data...");
            return "error";
        }
    }

    [HttpGet("listalikert")]
    public string TraerListalikert(string dato)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(dato))
            {
                return "error: dato vacío";
            }
            string rpta = "";
            daSQL odaSQL = new daSQL(_configuration, "CNX");
            rpta = odaSQL.ejecutarComando("dbo.usp_listar_encuestas_comportamientos", "@data", dato);
            return rpta;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al recuperar la data...");
            return "error";
        }
    }

    [HttpPost("grabar_formatoEval")]
    public string GrabarForm()
    {
        try
        {
            string rpta = "";
            string data = Request.Form["data"].ToString();

            daSQL odaSQL = new daSQL(_configuration, "CNX");
            rpta = odaSQL.ejecutarComando("dbo.usp_mantenimiento_cabecera_detalle_bucle", "@data", data);
            if (rpta == "")
            {
                _logger.LogError("dbo.usp_mantenimiento_cabecera_detalle_bucle '{data}'", data);
                rpta = "error";
            }
            return rpta;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al guardar la data...");
            return "error";
        }
    }

    [HttpPost("grabar_encuestaEvaLab")]
    public string Grabar_encuestaEvaLab()
    {
        try
        {
            string rpta = "";
            string data = Request.Form["data"].ToString();

            daSQL odaSQL = new daSQL(_configuration, "CNX");
            rpta = odaSQL.ejecutarComando("dbo.usp_registrar_encuesta_datos_evdeslab", "@data", data);
            if (rpta == "")
            {
                _logger.LogError("dbo.usp_registrar_encuesta_datos_evdeslab '{data}'", data);
                rpta = "error";
            }
            return rpta;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al guardar la data...");
            return "error";
        }
    }

}
