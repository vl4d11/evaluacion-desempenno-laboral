using Microsoft.AspNetCore.Mvc;

namespace prj_backend_eval_desempenno.Controllers;

[Route("evaluacion")]
public class EvaluacionController : Controller
{
    private readonly IWebHostEnvironment _env;

    public EvaluacionController(IWebHostEnvironment env)
    {
        _env = env;
    }

    [HttpGet("desempenno")]
    public ActionResult Desempenno()
    {
        ViewBag.IsDevelopment = _env.IsDevelopment();
        return View();
    }

    [HttpGet("test")]
    public string Test()
    {
        return "ok";
    }

}
