<?php
/**
 * @file
 * Contains \Drupal\visit_api\Form\PublisherAdminForm.
 */

namespace Drupal\visit_api\Form;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Database\Database;
use Drupal\taxonomy\Entity\Term;

/**
 * Configure custom settings for this site.
 */
class PublisherAdminForm extends ConfigFormBase {

    private $taxCount = 0;
    /**
     * Constructor for PublisherAdminForm.
     *
     * @param \Drupal\Core\Config\ConfigFactoryInterface $config_factory
     * The factory for configuration objects.
     */
    public function __construct(ConfigFactoryInterface $config_factory) {
        parent::__construct($config_factory);
    }

    /**
     * Returns a unique string identifying the form.
     *
     * @return string
     * The unique string identifying the form.
     */
    public function getFormId() {
        return 'publisher_admin_form';
    }

    /**
     * Gets the configuration names that will be editable.
     *
     * @return array
     * An array of configuration object names that are editable if called in
     * conjunction with the trait's config() method.
     */
    protected function getEditableConfigNames() {
        return ['config.publisher_custom'];
    }

    /**
     * Form constructor.
     *
     * @param array $form
     * An associative array containing the structure of the form.
     * @param \Drupal\Core\Form\FormStateInterface $form_state
     * The current state of the form.
     *
     * @return array
     * The form structure.
     */
    public function buildForm(array $form, FormStateInterface $form_state)
    {
        $conn = Database::getConnection();
        $record = array();
        $query = $conn->select('visit_api', 'm')
            ->orderBy('id', 'DESC')
            ->fields('m');
        $record = $query->execute()->fetchAssoc();
        $moduleHandler = \Drupal::service('module_handler');

        // Publisher Name
        $form['publisher_custom']['publisher_name'] = array(
            'publisher_name' => array(
                '#type' => 'textfield',
                '#title' => t('Publisher Name'),
                '#maxlength' => 255,
                '#description' => t('Enter the name of your publisher'),
                '#default_value' => (isset($record['publisher_name']) ? $record['publisher_name']:''),
                '#required' => TRUE,
            ),
        );

        // Publisher ID
        $form['publisher_custom']['publisher_id'] = array(
            'publisher_id' => array(
                '#type' => 'textfield',
                '#title' => t('Publisher ID'),
                '#maxlength' => 255,
                '#description' => t('Enter the id of your publisher'),
                '#default_value' => (isset($record['publisher_id']) ? $record['publisher_id']:''),
                '#required' => TRUE,
            ),
        );

        // Zeeto API Key
        $form['publisher_custom']['publisher_api_key'] = array(
            'publisher_api_key' => array(
                '#type' => 'textfield',
                '#title' => t('API Key'),
                '#maxlength' => 255,
                '#description' => t('Enter the API key given by Zeeto.'),
                '#default_value' => (isset($record['visit_api_key']) ? $record['visit_api_key']:''),
                '#required' => TRUE,
            ),
        );

        // Zeeto Visit API URL
        $form['publisher_custom']['publisher_visit_api_url'] = array(
            'publisher_visit_api_url' => array(
                '#type' => 'textfield',
                '#title' => t('Visit API URL'),
                '#maxlength' => 255,
                '#description' => t('Enter the Visit API URL given by Zeeto.'),
                '#default_value' => (isset($record['visit_api_url']) ? $record['visit_api_url']:''),
                '#required' => TRUE,
            ),
        );


        if ($moduleHandler->moduleExists('visitor_api')) {
            // Zeeto Visitor API URL
            $visitorRecord = array();
            $visitorQuery = $conn->select('visitor_api', 'm')
                ->orderBy('id', 'DESC')
                ->fields('m');
            $visitorRecord = $visitorQuery->execute()->fetchAssoc();

            $form['publisher_custom']['publisher_visitor_api_url'] = array(
                'publisher_visitor_api_url' => array(
                    '#type' => 'textfield',
                    '#title' => t('Visitor API URL'),
                    '#maxlength' => 255,
                    '#description' => t('Enter the Visitor API URL given by Zeeto.'),
                    '#default_value' => (isset($visitorRecord['visitor_api_url']) ? $visitorRecord['visitor_api_url'] : ''),
                    '#required' => TRUE,
                ),
            );
        }

        return parent::buildForm($form, $form_state);
    }

    /**
     * Form submission handler.
     *
     * @param array $form
     * An associative array containing the structure of the form.
     * @param \Drupal\Core\Form\FormStateInterface $form_state
     * The current state of the form.
     */
    public function submitForm(array &$form, FormStateInterface $form_state) {


        $pub_init = $this->config('config.publisher_custom')->get('pub_init');

        $field=$form_state->getValues();
        $publisher_name = $field['publisher_name'];
        $publisher_id = $field['publisher_id'];
        $publisher_api_key = $field['publisher_api_key'];
        $publisher_visit_api_url = $field['publisher_visit_api_url'];
        $visitFields  = array(
            'publisher_name'   => $publisher_name,
            'publisher_id'   => $publisher_id,
            'visit_api_key' =>  $publisher_api_key,
            'visit_api_url' =>  $publisher_visit_api_url,
        );
        $query = \Drupal::database();
        $query ->insert('visit_api')
            ->fields($visitFields)
            ->execute();


        $moduleHandler = \Drupal::service('module_handler');
        if ($moduleHandler->moduleExists('visitor_api')){

            $publisher_visitor_api_url = $field['publisher_visitor_api_url'];
            $visitorFields  = array(
                'publisher_name'   => $publisher_name,
                'publisher_id'   => $publisher_id,
                'visitor_api_key' =>  $publisher_api_key,
                'visitor_api_url' =>  $publisher_visitor_api_url,
            );
            $query = \Drupal::database();
            $query ->insert('visitor_api')
                ->fields($visitorFields)
                ->execute();

        }



        drupal_set_message("succesfully saved");
        parent::submitForm($form, $form_state);
    }
}