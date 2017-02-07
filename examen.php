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

//listaProfesores

$coursecontext = context_course::instance($course->id);
$role = $DB->get_record('role', array('shortname' => 'editingteacher'));
$teachers = get_role_users($role->id, $coursecontext);

$teachers_array = array_values($teachers);

//listaAlumnos

$coursecontext = context_course::instance($course->id);
$role = $DB->get_record('role', array('shortname' => 'student'));
$students = get_role_users($role->id, $coursecontext);

$students_array = array_values($students);

// Print the page header.

$PAGE->set_url('/mod/realquiztime/examen.php', array('id' => $cm->id));
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
	<script type="text/javascript">
        var id = <?php echo json_encode($id)?>;
        var idDocumento = <?php echo json_encode($realquiztime->id_documento)?>;
        var students = <?php echo json_encode($students_array)?>;
        var alumnos = []
        for (var i = 0; i < students.length; i++) {
            var alumno = {
                "nombre" : students[i].firstname,
                "apellidos" : students[i].lastname,
                "correo" : students[i].email
            }

            alumnos.push(alumno)
        }

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
        // console.log(profesores)
        // console.log(alumnos)
    </script>
    <link rel="stylesheet" type="text/css" href="<?php echo $CFG->wwwroot?>/mod/realquiztime/css/estilos.css">
    <link rel="stylesheet" type="text/css" href="<?php echo $CFG->wwwroot?>/mod/realquiztime/css/vis.css">
    <script type="text/javascript" src="<?php echo $CFG->wwwroot?>/mod/realquiztime/js/vis.js"></script>
    <script type="text/javascript" src="https://apis.google.com/js/api.js"></script>
    <script type="text/javascript" src="<?php echo $CFG->wwwroot?>/mod/realquiztime/js/realtime-client-utils.js"></script>
    <script type="text/javascript" src="<?php echo $CFG->wwwroot?>/mod/realquiztime/js/identificacion.js"></script>
    <script type="text/javascript" src="<?php echo $CFG->wwwroot?>/mod/realquiztime/js/examen.js"></script>
    <?php
    echo '
    <style>
        textarea {
            width: 100%;
            height: 100px;
        }
    </style>
    <div id="divInterfaz">
        <div>
        <ul class="ul">
            <li class="li"><a href="gestionar_preguntas.php?id='; echo json_encode($id); echo'">Gestionar preguntas</a></li>
            <li class="li"><a href="gestionar_grupos.php?id='; echo json_encode($id); echo'">Gestionar grupos</a></li>
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
            <li class="li"><a class="active" href="examen.php?id='; echo json_encode($id); echo'">Ver examen</a></li>
            <li class="li"><a href="calificaciones.php?id='; echo json_encode($id); echo'">Calificaciones</a></li>
            <li class="li"><a href="estadisticas.php?id='; echo json_encode($id); echo'">Estadísticas</a></li>
            <li class="li"><a href="borrar_examen.php?id='; echo json_encode($id); echo'">Borrar examen</a></li>
        </ul>
        </div>
        <div id="divExamen">
        </div>
    </div>
    <script>
        autorizar()
    </script>
    ';

}

echo $OUTPUT->footer();