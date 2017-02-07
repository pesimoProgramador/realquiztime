<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Prints a particular instance of realquiztime
 *
 * You can have a rather longer description of the file as well,
 * if you like, and it can span multiple lines.
 *
 * @package    mod_realquiztime
 * @copyright  2016 Your Name <your@email.address>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

// Replace realquiztime with the name of your module and remove this line.

require_once(dirname(dirname(dirname(__FILE__))).'/config.php');
require_once(dirname(__FILE__).'/lib.php');

$id = optional_param('id', 0, PARAM_INT);

$n  = optional_param('n', 0, PARAM_INT);  // ... realquiztime instance ID - it should be named as the first character of the module.

if ($id) {
    $cm         = get_coursemodule_from_id('realquiztime', $id, 0, false, MUST_EXIST);
    $course     = $DB->get_record('course', array('id' => $cm->course), '*', MUST_EXIST);
    $realquiztime  = $DB->get_record('realquiztime', array('id' => $cm->instance), '*', MUST_EXIST);
} else if ($n) {
    $realquiztime  = $DB->get_record('realquiztime', array('id' => $n), '*', MUST_EXIST);
    $course     = $DB->get_record('course', array('id' => $realquiztime->course), '*', MUST_EXIST);
    $cm         = get_coursemodule_from_instance('realquiztime', $realquiztime->id, $course->id, false, MUST_EXIST);
} else {
    error('You must specify a course_module ID or an instance ID');
}

require_login($course, true, $cm);

$context = context_module::instance($cm->id);
$alumno = has_capability('mod/realquiztime:submit', $context);

$event = \mod_realquiztime\event\course_module_viewed::create(array(
    'objectid' => $PAGE->cm->instance,
    'context' => $PAGE->context,
));
$event->add_record_snapshot('course', $PAGE->course);
$event->add_record_snapshot($PAGE->cm->modname, $realquiztime);
$event->trigger();

//Para el grafo
$actividades = $DB->get_records('realquiztime', array('course' => $course->id, 'una_vez_examen_activado' => 1));
$actividades_length = count($actividades);
$actividades_array = array_values($actividades);
$id_grafos_colaboracion = array();
for($i = 0; $i < $actividades_length; $i++) {
    array_push($id_grafos_colaboracion, $actividades_array[$i]->id_documento);
}

//listaProfesores

$coursecontext = context_course::instance($course->id);
$role = $DB->get_record('role', array('shortname' => 'editingteacher'));
$teachers = get_role_users($role->id, $coursecontext);

$teachers_array = array_values($teachers);

//Para la seleccion de grupos
$grupos = groups_get_all_groups($course->id);
$grupos_array = array_values($grupos);
$grupos_length = count($grupos_array);

$grupos_html = array();

if ($grupos_length > 0) {
    for ($i = 0; $i < $grupos_length; $i++) {
        
        $grupo = new stdClass();
        $grupo->nombreGrupo = $grupos_array[$i]->name;
        $grupo->miembros = array();
        
        $miembros_grupo = groups_get_members($grupos_array[$i]->id);
        $miembros_grupo_array = array_values($miembros_grupo);
        $miembros_grupo_length = count($miembros_grupo_array);
        
        for ($j = 0; $j < $miembros_grupo_length; $j++) {
            
            $usuario = new stdClass();
            $usuario->nombre = $miembros_grupo_array[$j]->firstname;
            $usuario->apellidos = $miembros_grupo_array[$j]->lastname;
            $usuario->correo = $miembros_grupo_array[$j]->email;
            
            array_push($grupo->miembros, $usuario);
        }
        
        array_push($grupos_html, $grupo);
    }
}

$grupos_html_length = count($grupos_html);

// Print the page header.

$PAGE->set_url('/mod/realquiztime/gestionar_grupos.php', array('id' => $cm->id));
$PAGE->set_title(format_string($realquiztime->name));
$PAGE->set_heading(format_string($course->fullname));

// Output starts here.
echo $OUTPUT->header();

// Conditions to show the intro can change to look for own settings or whatever.
if ($realquiztime->intro) {
    echo $OUTPUT->box(format_module_intro('realquiztime', $realquiztime, $cm->id), 'generalbox mod_introbox', 'realquiztimeintro');
}

if (!$alumno) {
?>
<link rel="stylesheet" type="text/css" href="<?php echo $CFG->wwwroot?>/mod/realquiztime/css/estilos.css">
<?php
    if ($realquiztime->una_vez_examen_activado == 1) {
        
        echo '
        <div>
        <ul class="ul">
            <li class="li"><a href="gestionar_preguntas.php?id='; echo json_encode($id); echo'">Gestionar preguntas</a></li>
            <li class="li"><a class="active" href="gestionar_grupos.php?id='; echo json_encode($id); echo'">Gestionar grupos</a></li>
            ';
        if ($realquiztime->examen_activado == 0) {
            echo '
            <li class="li"><a href="activar_examen.php?id='; echo json_encode($id); echo'">Activar examen</a></li>
            ';
        } else {
            echo '
            <li class="li"><a href="desactivar_examen.php?id='; echo json_encode($id); echo'">Desactivar examen</a></li>
            ';
        }
        echo'
            <li class="li"><a href="examen.php?id='; echo json_encode($id); echo'">Ver examen</a></li>
            <li class="li"><a href="calificaciones.php?id='; echo json_encode($id); echo'">Calificaciones</a></li>
            <li class="li"><a href="borrar_examen.php?id='; echo json_encode($id); echo'">Borrar examen</a></li>
        </ul>
        <h3>El examen ha sido activado y ya no se pueden cambiar los grupos</h3>
        </div>
        ';
    } else {
    ?>
    <script>
        var id = <?php echo json_encode($id) ?>;
        var idDocumento = <?php echo json_encode($realquiztime->id_documento)?>;
        var grupos = <?php echo json_encode($grupos_html) ?>;
        var idGrafos = <?php echo json_encode($id_grafos_colaboracion) ?>;
        var teachers = <?php echo json_encode($teachers_array)?>;
        var profesores = []
        for (var i = 0; i < teachers.length; i++) {
            var profesor = {
                "nombre" : teachers[i].firstname,
                "apellidos" : teachers[i].lastname,
                "correo" : teachers[i].email
            }

            profesores.push(profesor)
        }
    </script>
    
    <script type="text/javascript" src="https://apis.google.com/js/api.js"></script>
    <script type="text/javascript" src="<?php echo $CFG->wwwroot?>/mod/realquiztime/js/realtime-client-utils.js"></script>
    <script type="text/javascript" src="<?php echo $CFG->wwwroot?>/mod/realquiztime/js/identificacion.js"></script>
    <script type="text/javascript" src="<?php echo $CFG->wwwroot?>/mod/realquiztime/js/gestionar_grupos.js"></script>
    <link rel="stylesheet" type="text/css" href="<?php echo $CFG->wwwroot?>/mod/realquiztime/css/vis.css">
    <script type="text/javascript" src="<?php echo $CFG->wwwroot?>/mod/realquiztime/js/vis.js"></script>
    <?php
    echo '
    <div id="divInterfaz">
        <div>
        <ul class="ul">
            <li class="li"><a href="gestionar_preguntas.php?id='; echo json_encode($id); echo'">Gestionar preguntas</a></li>
            <li class="li"><a class="active" href="gestionar_grupos.php?id='; echo json_encode($id); echo'">Gestionar grupos</a></li>
            ';
        if ($realquiztime->examen_activado == 0) {
            echo '
            <li class="li"><a href="activar_examen.php?id='; echo json_encode($id); echo'">Activar examen</a></li>
            ';
        } else {
            echo '
            <li class="li"><a href="desactivar_examen.php?id='; echo json_encode($id); echo'">Desactivar examen</a></li>
            ';
        }
        echo'
            <li class="li"><a href="ver_examen.php?id='; echo json_encode($id); echo'">Ver examen</a></li>
            <li class="li"><a href="calificaciones.php?id='; echo json_encode($id); echo'">Calificaciones</a></li>
            <li class="li"><a href="estadisticas.php?id='; echo json_encode($id); echo'">Estadísticas</a></li>
            <li class="li"><a href="borrar_examen.php?id='; echo json_encode($id); echo'">Borrar examen</a></li>
        </ul>
        </div>
        <button onclick="buttonCargarGrafo()">Cargar grafo</button>
        <div id="divGrafo"></div>
        <h4>Elija los grupos de alumnos para el examen.</h4>
        <div id="divGruposMoodle">
            <br>
            <h5>Grupos de Moodle</h5>
            ';
            for ($i = 0; $i < $grupos_html_length; $i++) {
                echo "
                <label>
                    <input type='checkbox' name='checkboxGrupos' onclick='checkboxOnChange(this.value, this.checked)' value='{$i}'/>";
                    echo $grupos_html[$i]->nombreGrupo;
                    echo '
                    <ul style="list-style-type:disc">
                    ';
                    $miembros_html = $grupos_html[$i]->miembros;
                    $miembros_html_length = count($miembros_html);
                    for ($j = 0; $j < $miembros_html_length; $j++) {
                        echo "<li>{$miembros_html[$j]->nombre} {$miembros_html[$j]->apellidos} - {$miembros_html[$j]->correo}</li>";
                    }
                    echo '
                    </ul> 
                </label>
                ';
            }
    echo '
        </div>
    </div>
    <script>
        autorizar()
    </script>
    ';
    }
}

echo $OUTPUT->footer();