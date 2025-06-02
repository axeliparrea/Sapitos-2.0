package com.sapatos.tests;

import org.junit.jupiter.api.*;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.support.ui.ExpectedConditions;
import java.time.Duration;
import io.github.bonigarcia.wdm.WebDriverManager;

public class AdminTest {
    private WebDriver driver;

    @BeforeEach
    public void setUp() {
        WebDriverManager.chromedriver().setup();
        driver = new ChromeDriver();
        driver.manage().window().maximize();
    }

   @Test
public void testAdminAccessAndNavigation() throws InterruptedException {
    driver.get("http://localhost:5173/");

    driver.findElement(By.id("username")).sendKeys("admin@prueba.com");
    driver.findElement(By.id("password")).sendKeys("123");
    driver.findElement(By.id("loginButton")).click();

    WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(20));
    wait.until(ExpectedConditions.urlContains("/dashboard"));
    System.out.println("1.-Log in exitoso-Admin");

    WebElement homePage = wait.until(ExpectedConditions.presenceOfElementLocated(By.id("homeAdminPage")));
    Assertions.assertTrue(homePage.isDisplayed());
    Thread.sleep(1000);
////////////Inventario/////////////////////////////////
    WebElement inventarioBtn = wait.until(ExpectedConditions.elementToBeClickable(By.id("sidebarButton-inventario")));
    inventarioBtn.click();
    System.out.println("2.-Boton inventario exitoso-Admin");

    WebElement inventarioPage = wait.until(ExpectedConditions.presenceOfElementLocated(By.id("inventarioAdmin")));
    Assertions.assertTrue(inventarioPage.isDisplayed());
    Thread.sleep(3000);

    Thread.sleep(700);
    WebElement buscadorInv = driver.findElement(By.id("buscadorInventario"));
    buscadorInv.clear();
    Thread.sleep(700);
    buscadorInv.sendKeys("Playera Estampada M");
    System.out.println("INVENTARIO: 1.- Busqueda de Playera Estampada M");

    Thread.sleep(700);
    buscadorInv.clear();
    System.out.println("INVENTARIO: 2.- Busqueda limpiada");

    Thread.sleep(700);
    WebElement btnFiltrar = driver.findElement(By.id("btnFiltrarInventario"));
    ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block: 'center'});", btnFiltrar);
    Thread.sleep(700);
    btnFiltrar.click();
    System.out.println("INVENTARIO: 3.- Panel de filtros desplegado");

    Thread.sleep(700);
    WebElement filtroCategoria = wait.until(ExpectedConditions.elementToBeClickable(By.id("filter-cat-Playera")));
    ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block: 'center'});", filtroCategoria);
    Thread.sleep(700);
    filtroCategoria.click();
    System.out.println("INVENTARIO: 4.- Filtro de categoría 'Playera' aplicado");

    Thread.sleep(700);
    WebElement filtroUbicacion = wait.until(ExpectedConditions.elementToBeClickable(By.id("filter-loc-Oficina central")));
    ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block: 'center'});", filtroUbicacion);
    Thread.sleep(700);
    filtroUbicacion.click();
    System.out.println("INVENTARIO: 4.1.- Filtro de ubicacion 'Oficina central' aplicado");

    Thread.sleep(700);
    WebElement filtroTemporada = wait.until(ExpectedConditions.elementToBeClickable(By.id("filter-temp-Verano")));
    ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block: 'center'});", filtroTemporada);
    Thread.sleep(700);
    filtroTemporada.click();
    System.out.println("INVENTARIO: 4.2.- Filtro de temporada 'Verano' aplicado");


    Thread.sleep(700);
    WebElement filtroStock = wait.until(ExpectedConditions.elementToBeClickable(By.id("filter-stock-bajo")));
    ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block: 'center'});", filtroStock);
    Thread.sleep(700);
    filtroStock.click();
    System.out.println("INVENTARIO: 5.- Filtro de 'bajo stock' aplicado");

    Thread.sleep(700);
    WebElement btnLimpiarFiltros = driver.findElement(By.id("btnLimpiarFiltros"));
    ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block: 'center'});", btnLimpiarFiltros);
    Thread.sleep(700);
    btnLimpiarFiltros.click();
    System.out.println("INVENTARIO: 6.- Filtros limpiados correctamente");

    Thread.sleep(700);
    WebElement btnExportar = driver.findElement(By.id("btnExportarCSV"));
    ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block: 'center'});", btnExportar);
    Thread.sleep(700);
    btnExportar.click();
    System.out.println("INVENTARIO: 7.- Exportacion de inventario a CSV ejecutada");
//////////////Fin Inventario//////////////////////////////////////////////////////

/////////////////////Usuario///////////////////////////////////////////////////////
    WebElement usuariosBtn = wait.until(ExpectedConditions.elementToBeClickable(By.id("sidebarButton-usuarios")));
    usuariosBtn.click();
    System.out.println("3.-Boton usuarios exitoso-Admin");

    WebElement usuariopage = wait.until(ExpectedConditions.presenceOfElementLocated(By.id("usuariosAdmin")));
    Assertions.assertTrue(usuariopage.isDisplayed());
    Thread.sleep(1000);

    WebElement agregarBtn = wait.until(ExpectedConditions.elementToBeClickable(By.id("agregarUsuarioBtn")));
    agregarBtn.click();
    System.out.println("USUARIO: 1.-Boton Agregar Usuario presionado - Admin");

    //WebElement fileInput = driver.findElement(By.id("imageUpload"));
    //fileInput.sendKeys("C:\\Users\\Yazmin Alcazar\\Downloads\\Diagramas .png"); // Ruta válida en tu PC
    //Thread.sleep(700);


    driver.findElement(By.id("nombreInput")).sendKeys("nuevoUsuario");
    Thread.sleep(700);
    driver.findElement(By.id("emailInput")).sendKeys("nuevo@usuario.com");
    Thread.sleep(700);
    driver.findElement(By.id("contrasenaInput")).sendKeys("Holacomoestas32.");
    Thread.sleep(700);
    driver.findElement(By.id("organizacionInput")).sendKeys("NuevaOrg");
    Thread.sleep(700);

    WebElement rolDropdown = driver.findElement(By.id("rolSelect"));
    rolDropdown.click();
    rolDropdown.findElement(By.xpath("//option[@value='cliente']")).click();
    
    Thread.sleep(700);

    System.out.println("USUARIO: 2.-Formulario llenado correctamente - Admin");

    WebElement guardarBtn = driver.findElement(By.id("guardarBtn"));
    ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block: 'center'});", guardarBtn);
    Thread.sleep(700); // dejar que termine animación o scroll
    guardarBtn.click();

    WebElement tablaUsuarios = wait.until(ExpectedConditions.presenceOfElementLocated(By.id("usuariosAdmin")));
    Assertions.assertTrue(tablaUsuarios.isDisplayed());
    System.out.println("USUARIO: 3.-Redirección a tabla de usuarios confirmada - Admin");

        // Ir a la página 2
    Thread.sleep(700);
    WebElement pag2 = driver.findElement(By.id("paginacion-2"));
    ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block: 'center'});", pag2);
    Thread.sleep(700);
    pag2.click();
    System.out.println("Usuario: 4.-Cambiado a página 2 de usuarios - Admin");

    Thread.sleep(700);
    WebElement pag1 = driver.findElement(By.id("paginacion-1"));
    ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block: 'center'});", pag1);
    Thread.sleep(700);
    pag1.click();
    System.out.println("USUARIO: 5.-Regresado a página 1 de usuarios - Admin");

    Thread.sleep(700);
    // Buscar al usuario que se acaba de crear
    WebElement buscador = wait.until(ExpectedConditions.presenceOfElementLocated(By.id("buscadorUsuarios")));
    buscador.clear();
    buscador.sendKeys("nuevo@usuario.com");
    System.out.println("USUARIO: 6.-Búsqueda de usuario realizada - Admin");

    Thread.sleep(700);

    // Esperar a que aparezca el resultado
    WebElement resultadoCorreo = wait.until(ExpectedConditions.presenceOfElementLocated(
        By.xpath("//*[contains(text(), 'nuevo@usuario.com')]")));
    Assertions.assertTrue(resultadoCorreo.isDisplayed());
    System.out.println("USUARIO: 7.-Usuario buscado aparece correctamente - Admin");

    Thread.sleep(700);

    // Clic en editar (suponiendo que es el primer usuario en resultados filtrados)
    WebElement editarBtn = wait.until(ExpectedConditions.elementToBeClickable(By.id("editarUsuario-0")));
    editarBtn.click();
    System.out.println("USUARIO: 8.-Botón editar presionado - Admin");

    Thread.sleep(700);

    // Cambiar nombre del usuario
    WebElement nombreInput = wait.until(ExpectedConditions.presenceOfElementLocated(By.id("nombreInput")));
    nombreInput.clear();
    Thread.sleep(700);
    nombreInput.sendKeys("usuarioEditado");
    System.out.println("USUARIO: 9.-Nombre editado - Admin");

    Thread.sleep(700);

    // Scroll hacia botón actualizar
    WebElement actualizarBtn = wait.until(ExpectedConditions.elementToBeClickable(By.id("actualizarBtn")));
    ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block: 'center'});", actualizarBtn);
    Thread.sleep(700);
    actualizarBtn.click();
    System.out.println("USUARIO: 10.-Cambios guardados - Admin");

    // Confirmar regreso a la tabla
    WebElement tablaUsuarios2 = wait.until(ExpectedConditions.presenceOfElementLocated(By.id("usuariosAdmin")));
    Assertions.assertTrue(tablaUsuarios2.isDisplayed());
    System.out.println("USUARIO: 11.-Regreso a tabla de usuarios tras edición - Admin");

    Thread.sleep(700);

    // Buscar al usuario editado
    WebElement buscador2 = driver.findElement(By.id("buscadorUsuarios"));
    buscador2.clear();
    buscador2.sendKeys("usuarioEditado");
    System.out.println("USUARIO: 12.-Nueva búsqueda tras edición - Admin");

    Thread.sleep(700);

    // Esperar a que aparezca el usuario editado
    WebElement resultadoEditado = wait.until(ExpectedConditions.presenceOfElementLocated(
        By.xpath("//*[contains(text(), 'usuarioEditado')]")));
    Assertions.assertTrue(resultadoEditado.isDisplayed());
    System.out.println("USUARIO: 13.-Usuario editado aparece en resultados - Admin");

    Thread.sleep(700);

    // Eliminar usuario
    WebElement eliminarBtn = wait.until(ExpectedConditions.elementToBeClickable(By.id("eliminarUsuario-0")));
    eliminarBtn.click();
    System.out.println("USUARIO: 14.-Usuario eliminado - Admin");

    Thread.sleep(700);

    // Borrar búsqueda para ver todos los usuarios
    buscador2.clear();
    Thread.sleep(700);
    System.out.println("USUARIO: 15.-Búsqueda limpia, vista restaurada - Admin");
    Thread.sleep(700);
/////////////////////////Fin Usuario//////////////////////////////////////////////////

    WebElement pedidosBtn = wait.until(ExpectedConditions.elementToBeClickable(By.id("sidebarButton-pedidos")));
    pedidosBtn.click();
    System.out.println("4.-Boton pedidos exitoso-Admin");

    WebElement pedidospage = wait.until(ExpectedConditions.presenceOfElementLocated(By.id("pedidosAdmin")));
    Assertions.assertTrue(pedidospage.isDisplayed());
    Thread.sleep(1000);

    WebElement dashboardBtn = wait.until(ExpectedConditions.elementToBeClickable(By.id("sidebarButton-dashboard")));
    dashboardBtn.click();
    System.out.println("5.-Boton Dashboard exitoso-Admin");

    WebElement homeAgain = wait.until(ExpectedConditions.presenceOfElementLocated(By.id("homeAdminPage")));
    Assertions.assertTrue(homeAgain.isDisplayed());
    Thread.sleep(1000);

    wait.until(ExpectedConditions.presenceOfElementLocated(By.id("navbarHeader")));
    WebElement collapseBtn = wait.until(ExpectedConditions.elementToBeClickable(By.id("botonrayas")));
    collapseBtn.click();


    WebElement userMenuBtn = wait.until(ExpectedConditions.elementToBeClickable(By.id("userbutton")));
    userMenuBtn.click();
    System.out.println("6.-Boton usuario exitoso-Admin");
    Thread.sleep(1000);

    WebElement closeBtn = wait.until(ExpectedConditions.elementToBeClickable(By.id("tache")));
    closeBtn.click();
    System.out.println("7.-tache exitoso-Admin");
    Thread.sleep(1000);

    userMenuBtn.click();
    Thread.sleep(1000);

    //WebElement perfilBtn = wait.until(ExpectedConditions.elementToBeClickable(By.id("userMenuProfile")));
    //perfilBtn.click();
    //System.out.println("6.-funciona el boton mi perfil no reedirige-Admin");
    //Thread.sleep(1000);

    userMenuBtn = wait.until(ExpectedConditions.elementToBeClickable(By.id("userbutton")));
    userMenuBtn.click();
    System.out.println("8.-Boton usuario exitoso-Admin");
    Thread.sleep(1000);

    collapseBtn = wait.until(ExpectedConditions.elementToBeClickable(By.id("botonrayas")));
    collapseBtn.click();
    Thread.sleep(1000);

    userMenuBtn = wait.until(ExpectedConditions.elementToBeClickable(By.id("userbutton")));
    userMenuBtn.click();
    System.out.println("9.-Boton usuario exitoso-Admin");
    Thread.sleep(1000);

    closeBtn = wait.until(ExpectedConditions.elementToBeClickable(By.id("tache")));
    closeBtn.click();
    System.out.println("10.-tache exitoso-Admin");
    Thread.sleep(1000);

    userMenuBtn = wait.until(ExpectedConditions.elementToBeClickable(By.id("userbutton")));
    userMenuBtn.click();
    System.out.println("11.-Boton usuario exitoso-Admin");
    Thread.sleep(1000);

    //perfilBtn = wait.until(ExpectedConditions.elementToBeClickable(By.id("userMenuProfile")));
    //perfilBtn.click();
    //System.out.println("10.-funciona el boton mi perfil no reedirige-Admin");
    //Thread.sleep(1000);

    //userMenuBtn = wait.until(ExpectedConditions.elementToBeClickable(By.id("userbutton")));
    //userMenuBtn.click();
    //System.out.println("11.-Boton usuario exitoso-Admin");
    //Thread.sleep(1000);

    WebElement logoutBtn = wait.until(ExpectedConditions.elementToBeClickable(By.id("logoutButton")));
    logoutBtn.click();
    Thread.sleep(1000);

    wait.until(ExpectedConditions.urlToBe("http://localhost:5173/"));
    System.out.println("12.-Sesion cerrada correctamente-Admin");
}



    @AfterEach
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }
}
